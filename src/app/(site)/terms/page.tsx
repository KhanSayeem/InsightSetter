import type { JSX } from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | InsightSetter',
  description:
    'InsightSetter Terms of Service describing acceptable use, contributor expectations, and legal terms.',
};

const EFFECTIVE_DATE = 'October 30, 2025';

const sections: Array<{ title: string; body: JSX.Element }> = [
  {
    title: 'Acceptance of Terms',
    body: (
      <p>
        These Terms of Service (“Terms”) govern your access to and use of the InsightSetter website, newsletter, contributor
        portal, and related services (collectively, the “Services”) operated by InsightSetter Media LLC (“InsightSetter,” “we,”
        “us,” or “our”). By accessing or using the Services, you agree to be bound by these Terms and our{' '}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        . If you do not agree, you must discontinue use of the Services.
      </p>
    ),
  },
  {
    title: 'Eligibility and Accounts',
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>
          You must be at least 18 years old and capable of forming a binding contract to use the Services. You represent that
          any registration information you provide is accurate and will remain up to date.
        </li>
        <li>
          You are responsible for safeguarding your account credentials and for all activities that occur under your account.
          Notify us immediately at{' '}
          <Link href="mailto:support@insightsetter.com" className="text-primary hover:underline">
            support@insightsetter.com
          </Link>{' '}
          if you suspect unauthorized access.
        </li>
      </ul>
    ),
  },
  {
    title: 'Contributor Submissions',
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>
          By submitting content, data, graphics, or other materials (“Submission”), you represent that you own the rights to
          the Submission or have obtained all necessary permissions.
        </li>
        <li>
          You grant InsightSetter a worldwide, royalty-free, sublicensable license to review, edit, publish, distribute,
          translate, and promote the Submission in any media for editorial and promotional purposes, subject to any separate
          contributor agreement we may execute with you.
        </li>
        <li>
          We may edit or decline Submissions in our sole editorial discretion and are under no obligation to publish any
          material you provide.
        </li>
      </ul>
    ),
  },
  {
    title: 'Acceptable Use',
    body: (
      <ul className="list-disc space-y-2 pl-6">
        <li>Do not engage in unlawful, fraudulent, or abusive activity on the Services.</li>
        <li>
          Do not attempt to interfere with or disrupt the integrity, security, or performance of our infrastructure or the data
          of other users.
        </li>
        <li>
          Do not misrepresent your affiliation or impersonate any person or entity while interacting with InsightSetter’s teams
          or audience.
        </li>
      </ul>
    ),
  },
  {
    title: 'Intellectual Property',
    body: (
      <p>
        The Services, including all editorial content, graphics, logos, and trademarks, are owned by InsightSetter or our
        licensors and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative
        works unless you have our prior written consent or your use is otherwise permitted by law.
      </p>
    ),
  },
  {
    title: 'Third-Party Services',
    body: (
      <p>
        The Services may link to third-party websites or tools. InsightSetter does not control and is not responsible for
        third-party content, policies, or practices. Accessing third-party services is at your own risk and may be subject to
        additional terms.
      </p>
    ),
  },
  {
    title: 'Disclaimers',
    body: (
      <p>
        The Services are provided on an “as is” and “as available” basis without warranties of any kind, whether express or
        implied. InsightSetter disclaims all warranties, including merchantability, fitness for a particular purpose,
        non-infringement, and accuracy of information. InsightSetter does not guarantee uninterrupted or error-free operation.
      </p>
    ),
  },
  {
    title: 'Limitation of Liability',
    body: (
      <p>
        To the fullest extent permitted by law, InsightSetter and its officers, directors, employees, and agents will not be
        liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
        whether incurred directly or indirectly, arising from your use of the Services. Our aggregate liability will not exceed
        one hundred U.S. dollars (US$100).
      </p>
    ),
  },
  {
    title: 'Indemnification',
    body: (
      <p>
        You agree to indemnify and hold InsightSetter harmless from any claims, liabilities, damages, losses, or expenses,
        including reasonable attorneys’ fees, arising out of or in any way connected with your Submissions, your violation of
        these Terms, or your misuse of the Services.
      </p>
    ),
  },
  {
    title: 'Termination',
    body: (
      <p>
        We may suspend or terminate your access to the Services at any time for conduct that we believe violates these Terms,
        our policies, or applicable law. You may terminate your account by contacting us at{' '}
        <Link href="mailto:support@insightsetter.com" className="text-primary hover:underline">
          support@insightsetter.com
        </Link>
        .
      </p>
    ),
  },
  {
    title: 'Governing Law and Dispute Resolution',
    body: (
      <p>
        These Terms are governed by the laws of the State of California, excluding its conflict of law provisions. Any dispute
        arising under or relating to the Terms will be resolved exclusively in the state or federal courts located in San
        Francisco County, California, and you consent to personal jurisdiction and venue in those courts.
      </p>
    ),
  },
  {
    title: 'Changes to the Terms',
    body: (
      <p>
        We may update these Terms from time to time to reflect operational, legal, or regulatory changes. We will post the
        updated Terms with a new “Effective date” and may provide additional notice if required. Your continued use of the
        Services after changes take effect means you accept the updated Terms.
      </p>
    ),
  },
  {
    title: 'Contact',
    body: (
      <p>
        Questions about these Terms can be directed to{' '}
        <Link href="mailto:legal@insightsetter.com" className="text-primary hover:underline">
          legal@insightsetter.com
        </Link>{' '}
        or mailed to InsightSetter Media LLC, Attn: Legal, 548 Market Street, Suite 62487, San Francisco, CA 94104.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="space-y-12 py-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Governance</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Effective date: {EFFECTIVE_DATE}</p>
        <p className="max-w-2xl text-base text-muted-foreground">
          These Terms outline the rules that govern your use of InsightSetter’s editorial products and community features.
          Please read them carefully before subscribing, submitting content, or collaborating with our team.
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

