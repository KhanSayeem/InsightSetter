import type { JSX } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | InsightSetter',
  description:
    'InsightSetter privacy policy outlining how we collect, use, and protect personal data.',
};

const LAST_UPDATED = 'October 30, 2025';

const sections: Array<{
  title: string;
  body: JSX.Element;
}> = [
  {
    title: 'Overview',
    body: (
      <p>
        InsightSetter (“we,” “us,” or “our”) is committed to safeguarding the privacy of visitors, subscribers, and
        contributors. This Privacy Policy explains the personal data we collect, how we use it, and the choices you have.
        It applies wherever we operate our editorial products, including the InsightSetter website, newsletter, and related
        services (collectively, the “Services”).
      </p>
    ),
  },
  {
    title: 'Data We Collect',
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>Account and contact details:</strong> name, email address, employer, role, and any optional profile
          information you share when submitting articles or partnering with us.
        </li>
        <li>
          <strong>Newsletter information:</strong> email address, subscription preferences, and engagement metrics (opens,
          clicks) collected via our email service provider so we can tailor and improve the briefing.
        </li>
        <li>
          <strong>Usage data:</strong> device identifiers, IP address, browser type, and pages visited recorded through
          analytics tools and server logs to secure our Services and understand readership trends.
        </li>
        <li>
          <strong>Submissions and correspondence:</strong> content you provide when pitching stories, requesting support,
          or otherwise communicating with our editorial or partnerships teams.
        </li>
      </ul>
    ),
  },
  {
    title: 'How We Use Personal Data',
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>Delivering newsletters, account notifications, and service-related updates.</li>
        <li>
          Reviewing, editing, and publishing submitted content and attributing authors where appropriate.
        </li>
        <li>Operating, maintaining, and securing our infrastructure, including preventing fraud or abuse.</li>
        <li>
          Analyzing readership metrics to refine editorial strategy, subject matter coverage, and user experience.
        </li>
        <li>Complying with legal obligations, enforcing our agreements, and responding to lawful requests.</li>
      </ul>
    ),
  },
  {
    title: 'Legal Bases for Processing',
    body: (
      <p>
        We process personal data only when we have a lawful basis, including your consent (e.g., for optional marketing
        communications), fulfillment of a contract (delivering your subscription or contributor account), compliance with
        legal obligations, and our legitimate interests in operating an editorial publication. We balance those interests
        against your rights and expectations.
      </p>
    ),
  },
  {
    title: 'Data Sharing and Transfers',
    body: (
      <p>
        We do not sell personal data. We may share limited information with carefully selected service providers who help us
        operate the Services—such as email delivery, analytics, hosting, content moderation, and payment partners. These
        providers must follow contractual safeguards and use data only on our instructions. If data is transferred outside
        your home jurisdiction, we take steps to ensure an adequate level of protection and rely on appropriate transfer
        mechanisms where required.
      </p>
    ),
  },
  {
    title: 'Retention',
    body: (
      <p>
        We retain personal data only for as long as needed to deliver the Services, comply with legal obligations, resolve
        disputes, and enforce agreements. Newsletter subscribers can unsubscribe at any time, at which point we maintain
        minimal records to honor your opt-out request. Editorial submissions and related correspondence may be archived to
        maintain a verifiable edit history.
      </p>
    ),
  },
  {
    title: 'Your Rights and Choices',
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>Access, update, or delete personal data we hold about you, subject to applicable law.</li>
        <li>Opt out of marketing emails by using the unsubscribe link in our communications.</li>
        <li>
          Request a copy of your data or object to certain processing activities by contacting us at{' '}
          <Link href="mailto:privacy@insightsetter.com" className="text-primary hover:underline">
            privacy@insightsetter.com
          </Link>
          .
        </li>
        <li>Appeal decisions where required by law or lodge a complaint with your local data protection authority.</li>
      </ul>
    ),
  },
  {
    title: 'Cookies and Similar Technologies',
    body: (
      <p>
        We use first-party cookies and similar technologies to remember preferences, keep you signed in, and measure
        audience engagement. Where consent is required, we will request it the first time you visit. You can disable cookies
        via your browser settings, though some features may become unavailable.
      </p>
    ),
  },
  {
    title: 'Children’s Privacy',
    body: (
      <p>
        The Services are intended for professionals and operators. We do not knowingly collect personal data from individuals
        under 16. If you believe a minor has provided information, contact us and we will remove it promptly.
      </p>
    ),
  },
  {
    title: 'Security',
    body: (
      <p>
        We implement administrative, technical, and physical safeguards designed to protect personal data against
        unauthorized access, loss, or misuse. These measures include encrypted connections, least-privilege access controls,
        periodic security reviews, and vendor due diligence. However, no online service can guarantee absolute security.
      </p>
    ),
  },
  {
    title: 'Updates to This Policy',
    body: (
      <p>
        We may revise this policy to reflect operational, legal, or regulatory changes. We will post the updated version with
        a revised “Last updated” date and, where appropriate, notify you through the Services. Your continued use of the
        Services after a change means you accept the updated policy.
      </p>
    ),
  },
  {
    title: 'Contact',
    body: (
      <p>
        InsightSetter is operated by InsightSetter Media LLC. Questions or requests regarding this Privacy Policy should be
        sent to{' '}
        <Link href="mailto:privacy@insightsetter.com" className="text-primary hover:underline">
          privacy@insightsetter.com
        </Link>
        . You can also write to: InsightSetter Media LLC, Attn: Privacy, 548 Market Street, Suite 62487, San Francisco, CA 94104.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-12 py-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Governance</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        <p className="max-w-2xl text-base text-muted-foreground">
          This policy explains what personal data InsightSetter collects, how we use and share it, and the controls you have.
          Please review it carefully before engaging with our publications or submitting content.
        </p>
      </header>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">{section.body}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

