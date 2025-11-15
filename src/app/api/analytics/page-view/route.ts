import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

import { prisma } from '@/lib/prisma';

function isBot(ua: string | null | undefined) {
  if (!ua) return false;
  return /bot|crawl|spider|headless|preview|facebookexternalhit|Slackbot/i.test(ua);
}

export async function POST(request: Request) {
  try {
    const h = await headers();
    const ua = h.get('user-agent') || '';
    if (isBot(ua)) return new NextResponse(null, { status: 204 });

    const countryHeader = h.get('cf-ipcountry');
    const country = countryHeader && countryHeader.length === 2 ? countryHeader.toUpperCase() : null;

    const { articleId } = await request.json().catch(() => ({}));
    if (!articleId || typeof articleId !== 'string') {
      return NextResponse.json({ error: 'articleId required' }, { status: 400 });
    }

    const exists = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, slug: true, status: true },
    });
    if (!exists) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[page-view] article not found for id', { articleId });
      }
      return new NextResponse(null, { status: 204 });
    }

    try {
      await prisma.pageView.create({
        data: {
          articleId,
          countryCode: country,
          isBot: false,
        },
      });
      if (process.env.NODE_ENV !== 'production') {
        console.info('[page-view] recorded', { articleId, slug: exists.slug, country });
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[page-view] failed to insert', {
          articleId,
          country,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
