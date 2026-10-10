import { EyeOff, FileLock2, ListChecks, Stamp, UsersRound } from 'lucide-react';
import { Disclaimer } from '@/components/layout/Disclaimer';
import { PageHeader, Section, SectionHeading } from '@/components/layout/Section';
import { Seo } from '@/components/seo/Seo';
import { ButtonLink } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const STEPS = [
  { title: 'Register as a seller', body: 'Create a seller account. Your identity and company details are never published.' },
  { title: 'Prepare your submission', body: 'Describe the business, its authorisations and the transaction you are seeking. Save drafts as you go.' },
  { title: 'Upload documents privately', body: 'Upload licences, corporate documents and financials to private storage. Only you and authorised reviewers can access them.' },
  { title: 'Review and verification', body: 'Our reviewers may check company and regulator records and request changes before approval.' },
  { title: 'Approval and publication', body: 'An administrator approves an anonymised listing. Only then is it published to the marketplace.' },
  { title: 'Screened introductions', body: 'We review enquiries and introduce qualified buyers under NDA with your agreement.' },
];

const WHAT_YOU_NEED = [
  'Legal name and registration number of the regulated entity (kept confidential)',
  'Licence or authorisation type, regulator and current status',
  'Operating status, team size and indicative revenue range',
  'Proposed transaction structure and asking price, or price on request',
  'What is included: licence, banking relationships, technology, client book, staff',
  'Confirmation that you are authorised to market the business',
];

export default function SellPage() {
  const { user, hasRole } = useAuth();
  const startHref = user ? (hasRole('seller') ? '/dashboard/submissions/new' : '/dashboard/profile') : '/register/seller';
  return (
    <>
      <Seo
        title="Sell a regulated financial business or licence"
        description="Submit your bank, EMI, payment institution, crypto business, brokerage, investment firm, insurer or licence confidentially. Listings are anonymised and published only after approval."
      />
      <PageHeader
        eyebrow="For sellers"
        title="Sell your regulated business discreetly"
        description="Reach qualified strategic and financial acquirers without disclosing your identity publicly. Every listing is reviewed and approved before it is published."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sell' }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink to={startHref} variant="gold" size="lg">
            Start a confidential submission
          </ButtonLink>
          {!user && (
            <ButtonLink to="/login?redirect=/dashboard/submissions" variant="outline-light" size="lg">
              Sign in
            </ButtonLink>
          )}
        </div>
        {user && !hasRole('seller') && (
          <p className="mt-3 text-sm text-white/60">
            Your account does not have seller access yet. Enable it from your profile.
          </p>
        )}
      </PageHeader>
      <Section>
        <SectionHeading eyebrow="Process" title="From submission to introduction" />
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
              <span className="font-display text-2xl font-semibold text-gold-600 tabular">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section tone="slate">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Preparation</p>
            <h2 className="mt-3 text-3xl font-semibold">What you will need</h2>
            <ul className="mt-6 space-y-3">
              {WHAT_YOU_NEED.map((w) => (
                <li key={w} className="flex gap-3 text-slate-700">
                  <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
          <ul className="grid grid-cols-1 gap-5 self-start sm:grid-cols-2">
            {[
              { icon: EyeOff, title: 'Anonymised', body: 'Public listings never show your company name, registration or licence numbers.' },
              { icon: FileLock2, title: 'Private documents', body: 'Documents sit in private storage with access limited to you and authorised reviewers.' },
              { icon: Stamp, title: 'Approval first', body: 'Submissions stay unpublished until an administrator approves them.' },
              { icon: UsersRound, title: 'Screened buyers', body: 'Enquiries are reviewed by our team before any introduction.' },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-xl border border-slate-200 bg-white p-5">
                <Icon className="h-5 w-5 text-gold-600" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
      <Section>
        <Disclaimer />
      </Section>
    </>
  );
}
