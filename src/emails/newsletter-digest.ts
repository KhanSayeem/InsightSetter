type DigestArticle = {
  title: string;
  summary: string | null;
  slug: string;
  categoryLabel: string;
  publishedAt: string;
  tags: string[];
};

type NewsletterDigestProps = {
  articles: DigestArticle[];
  sentAt?: string;
};

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTags(tags: string[]) {
  return tags
    .slice(0, 4)
    .map(
      (tag) => `<span
        style="font-size: 11px; padding: 4px 10px; border-radius: 9999px; background-color: #eef2ff; color: #4338ca; text-transform: lowercase;"
      >#${escapeHtml(tag)}</span>`,
    )
    .join('');
}

function renderArticles(articles: DigestArticle[]) {
  const origin = process.env.APP_ORIGIN ?? 'https://insightsetter.manacorp.org';

  return articles
    .map(
      (article) => `<tr>
        <td style="padding-bottom: 28px;">
          <div style="border-radius: 16px; border: 1px solid #e5e7eb; padding: 24px; background-color: #f8fafc;">
            <p style="font-size: 11px; letter-spacing: 0.35em; text-transform: uppercase; color: #6366f1; margin: 0 0 12px; font-weight: 600;">
              ${escapeHtml(article.categoryLabel)}
            </p>
            <h2 style="font-size: 20px; margin: 0 0 12px; line-height: 1.4;">
              <a href="${origin}/articles/${encodeURIComponent(article.slug)}" style="color: #111827; text-decoration: none;">
                ${escapeHtml(article.title)}
              </a>
            </h2>
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 12px; color: #4b5563;">
              ${escapeHtml(article.summary ?? 'Read the full perspective on InsightSetter.')}
            </p>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px;">
              ${renderTags(article.tags)}
            </div>
          </div>
        </td>
      </tr>`,
    )
    .join('');
}

export function renderNewsletterDigestEmail({ articles, sentAt }: NewsletterDigestProps) {
  const articleRows = renderArticles(articles);
  const sentTimestamp = escapeHtml(sentAt ?? new Date().toLocaleString());

  return `<!DOCTYPE html>
<html>
  <body style="font-family: Inter, Arial, sans-serif; background-color: #f9fafb; padding: 32px; color: #111827;">
    <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; padding: 32px; border: 1px solid #e5e7eb;">
      <tbody>
        <tr>
          <td>
            <p style="font-size: 12px; letter-spacing: 0.4em; text-transform: uppercase; color: #6366f1; margin: 0 0 16px; font-weight: 600;">
              InsightSetter briefing
            </p>
            <h1 style="font-size: 26px; margin: 0 0 16px; line-height: 1.3;">
              Signals worth your next coffee.
            </h1>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; color: #4b5563;">
              Curated snapshots across markets, operators, and capital strategy. Forward it to someone who needs a sharper read on the week.
            </p>
          </td>
        </tr>
        ${articleRows}
        <tr>
          <td>
            <p style="font-size: 13px; color: #6b7280; margin: 0 0 4px;">
              Sent ${sentTimestamp}
            </p>
            <p style="font-size: 13px; color: #9ca3af; margin: 0;">
              You're receiving this because you subscribed at InsightSetter.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
}
