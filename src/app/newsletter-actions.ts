'use server';

import { Resend } from 'resend';
import { revalidatePath } from 'next/cache';

import { ArticleStatus, SubscriberStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { renderNewsletterDigestEmail } from '@/emails/newsletter-digest';
import { renderNewsletterWelcomeEmail } from '@/emails/newsletter-welcome';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM_EMAIL;

function getResendClient() {
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  if (!resendFrom) {
    throw new Error('RESEND_FROM_EMAIL is not configured');
  }

  return new Resend(resendApiKey);
}

export type NewsletterSubscribeState = {
  ok: boolean;
  message: string;
};

export async function subscribeNewsletterAction(
  _prev: NewsletterSubscribeState | undefined,
  formData: FormData,
): Promise<NewsletterSubscribeState> {
  void _prev;
  const email = (formData.get('email') ?? '').toString().trim().toLowerCase();

  if (!email) {
    return { ok: false, message: 'Enter an email address to subscribe.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'That email looks off. Try again?' };
  }

  const existing = await prisma.subscriber.findUnique({ where: { email } });

  await prisma.subscriber.upsert({
    where: { email },
    update: {
      status: SubscriberStatus.ACTIVE,
      unsubscribedAt: null,
    },
    create: {
      email,
      status: SubscriberStatus.ACTIVE,
    },
  });

  try {
    if (!existing || existing.status === SubscriberStatus.UNSUBSCRIBED) {
      const resend = getResendClient();

      await resend.emails.send({
        from: resendFrom!,
        to: email,
        subject: 'Welcome to the InsightSetter briefing',
        html: renderNewsletterWelcomeEmail({ date: new Date().toLocaleDateString() }),
      });
    }
  } catch (error) {
    console.error('[newsletter] failed to send welcome email', error);
  }

  revalidatePath('/');
  revalidatePath('/admin');

  return {
    ok: true,
    message: existing
      ? 'You’re back on the list. Look out for the next briefing.'
      : 'Thanks for subscribing! Look out for the next briefing.',
  };
}

export type NewsletterDigestState = {
  ok: boolean;
  message: string;
};

export async function sendDigestAction(
  _prev: NewsletterDigestState,
  formData: FormData,
): Promise<NewsletterDigestState> {
  if (!(await isAdminAuthenticated())) {
    return { ok: false, message: 'Session expired. Sign back in to send digests.' };
  }

  const subject =
    (formData.get('subject') ?? '').toString().trim() || 'InsightSetter briefing';

  const articleCount = Number(formData.get('articleCount')) || 5;
  const recipientMode = (formData.get('recipientMode') ?? '').toString();
  const selectedRecipients = formData
    .getAll('recipients')
    .map((value) => value.toString().trim().toLowerCase())
    .filter(Boolean);

  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    take: Math.min(Math.max(articleCount, 3), 8),
    select: {
      title: true,
      summary: true,
      slug: true,
      category: {
        select: {
          label: true,
        },
      },
      tags: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  if (articles.length === 0) {
    return { ok: false, message: 'No published articles yet. Add a few before sending a digest.' };
  }

  const subscribers = await prisma.subscriber.findMany({
    where: { status: SubscriberStatus.ACTIVE },
    select: { email: true },
  });

  if (subscribers.length === 0) {
    return { ok: false, message: 'No active subscribers to send to yet.' };
  }

  let recipientEmails: string[] = [];

  if (recipientMode === 'all') {
    recipientEmails = subscribers.map((subscriber) => subscriber.email);
  } else if (recipientMode === 'custom') {
    const uniqueSelected = Array.from(new Set(selectedRecipients));
    if (uniqueSelected.length === 0) {
      return { ok: false, message: 'Select at least one subscriber before sending.' };
    }
    const allowedEmails = new Set(subscribers.map((subscriber) => subscriber.email));
    recipientEmails = uniqueSelected.filter((email) => allowedEmails.has(email));

    if (recipientEmails.length === 0) {
      return { ok: false, message: 'Your selection no longer matches active subscribers.' };
    }
  } else {
    return { ok: false, message: 'Choose who should receive the digest.' };
  }

  const resend = getResendClient();

  const digestArticles = articles.map((article) => ({
    title: article.title,
    summary: article.summary,
    slug: article.slug,
    categoryLabel: article.category?.label ?? 'InsightSetter',
    publishedAt: (article.publishedAt ?? article.createdAt).toISOString(),
    tags: article.tags,
  }));

  try {
    await resend.emails.send({
      from: resendFrom!,
      to: recipientEmails,
      subject,
      html: renderNewsletterDigestEmail({
        articles: digestArticles,
        sentAt: new Date().toLocaleString(),
      }),
    });

    revalidatePath('/admin');
    return { ok: true, message: `Digest sent to ${recipientEmails.length} subscriber${recipientEmails.length === 1 ? '' : 's'}.` };
  } catch (error) {
    console.error('[newsletter] failed to send digest', error);
    return { ok: false, message: 'Digest send failed. Check the server logs for details.' };
  }
}




