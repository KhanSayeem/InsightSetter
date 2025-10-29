type NewsletterWelcomeProps = {
  date?: string;
};

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderNewsletterWelcomeEmail({ date }: NewsletterWelcomeProps) {
  const formattedDate = escapeHtml(date ?? new Date().toLocaleDateString());

  return `<!DOCTYPE html>
<html>
  <body style="font-family: Inter, Arial, sans-serif; background-color: #f9fafb; padding: 32px; color: #111827;">
    <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
      <tbody>
        <tr>
          <td>
            <p style="font-size: 12px; letter-spacing: 0.4em; text-transform: uppercase; color: #6366f1; margin: 0 0 16px; font-weight: 600;">
              InsightSetter
            </p>
            <h1 style="font-size: 24px; margin: 0 0 16px; line-height: 1.3;">
              Welcome aboard the InsightSetter briefing.
            </h1>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
              Thanks for subscribing. Every send captures the sharpest signals across finance, technology, operators, and capital markets. Expect curated analysis, fast takes worth bookmarking, and long-form frameworks that go beyond the news cycle.
            </p>
            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
              We'll drop the next edition in your inbox soon. In the meantime, feel free to share your perspective—new submissions shape what makes it into future briefings.
            </p>
            <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0;">
              ${formattedDate}
            </p>
            <p style="font-size: 14px; color: #6b7280; margin: 4px 0 0;">
              - The InsightSetter editors
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
}
