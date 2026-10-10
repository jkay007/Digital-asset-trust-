import { CalendarCheck2, CircleSlash, FileSearch, UserCheck } from 'lucide-react';
import { VerificationBadge } from '@/components/marketplace/VerificationBadge';
import { Disclaimer } from '@/components/layout/Disclaimer';
import { PageHeader, Section, SectionHeading } from '@/components/layout/Section';
import { Seo } from '@/components/seo/Seo';
import { VERIFICATION_LEVELS } from '@/lib/constants';

const EXAMPLES: Record<string, string[]> = {
  unverified: ['Listing content is exactly as supplied by the seller', 'No reviewer record exists'],
  company_checked: [
    'Company located on the official companies register',
    'Registration number, status and registered office matched',
    'Basic good-standing indicators reviewed',
  ],
  regulator_record_checked: [
    'Stated licence or registration found on the regulator’s public register',
    'Licence type, entity name and status matched',
    'Public enforcement notices searched where available',
  ],
  documents_reviewed: [
    'Supporting licence, corporate and regulatory documents reviewed',
    'Documents held in private storage; never published',
    'Reviewer notes recorded against the listing',
  ],
};

const PRINCIPLES = [
  {
    icon: UserCheck,
    title: 'Only authorised reviewers can record checks',
    body: 'Verification records can be created only by accounts holding the reviewer or administrator role. This is enforced by database security rules, not just the interface.',
  },
  {
    icon: CalendarCheck2,
    title: 'Every state is dated and attributable',
    body: 'Each record stores the reviewer, the method, the source consulted and the date. The badge on a listing is derived from the latest record.',
  },
  {
    icon: CircleSlash,
    title: 'Sellers cannot set their own state',
    body: 'Sellers and buyers have no ability to change a listing’s verification state. Records are append-only and every change is written to the audit log.',
  },
  {
    icon: FileSearch,
    title: 'Checks are not due diligence',
    body: 'Verification confirms specific facts on a specific date. It does not assess value, financial health, compliance quality or whether a regulator will approve your acquisition.',
  },
];

export default function VerificationPage() {
  return (
    <>
      <Seo
        title="How verification works"
        description="Understand the four verification states on Global Financial Assets (Unverified, Company Checked, Regulator Record Checked, Documents Reviewed) and what they do and do not mean."
      />
      <PageHeader
        eyebrow="Trust & verification"
        title="How verification works"
        description="Four clearly defined states, recorded by authorised reviewers, so you know exactly what has been checked and what still needs your own diligence."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Verification' }]}
      />
      <Section>
        <SectionHeading eyebrow="The four states" title="From unverified to documents reviewed" />
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {VERIFICATION_LEVELS.map((level, i) => (
            <li key={level.value} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <VerificationBadge level={level.value} size="md" />
                <span className="font-display text-3xl font-semibold text-slate-200 tabular" aria-hidden="true">
                  {i}
                </span>
              </div>
              <p className="mt-4 leading-relaxed text-slate-700">{level.description}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-slate-600">
                {EXAMPLES[level.value]?.map((e) => (
                  <li key={e} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold-600" aria-hidden="true" />
                    {e}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>
      <Section tone="slate">
        <SectionHeading eyebrow="Principles" title="Built so that verification cannot be overstated" />
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-xl border border-slate-200 bg-white p-6">
              <Icon className="h-6 w-6 text-gold-600" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50 p-6">
            <h2 className="text-xl font-semibold text-violet-950">Demo listings</h2>
            <p className="mt-3 text-sm leading-relaxed text-violet-900">
              While the platform is being demonstrated, it contains fictitious DEMO listings. Any verification state shown
              on a demo listing is illustrative only, is labelled “Demo”, and does not mean any check has been performed.
              Enquiries are disabled for demo listings.
            </p>
          </div>
          <Disclaimer />
        </div>
      </Section>
    </>
  );
}
