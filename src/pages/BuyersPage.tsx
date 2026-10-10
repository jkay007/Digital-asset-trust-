import { BellRing, Bookmark, Building, Search, Target } from 'lucide-react';
import { Disclaimer } from '@/components/layout/Disclaimer';
import { PageHeader, Section, SectionHeading } from '@/components/layout/Section';
import { Seo } from '@/components/seo/Seo';
import { ButtonLink } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const FEATURES = [
  { icon: Search, title: 'Structured search', body: 'Filter by category, jurisdiction, price, transaction type, operating status and verification state.' },
  { icon: Bookmark, title: 'Shortlists', body: 'Save opportunities to your dashboard and track your confidential enquiries.' },
  { icon: Target, title: 'Acquisition mandates', body: 'Describe what you are looking for. We match your mandate against new submissions, including those never published.' },
  { icon: BellRing, title: 'Qualified introductions', body: 'Enquiries are screened by our team and introductions made under NDA.' },
];

const BUYERS = [
  'Strategic acquirers and fintechs seeking licences and market entry',
  'Private equity and investment funds',
  'Family offices',
  'Banks and financial institutions',
  'Entrepreneurs and advisers acting for principals',
];

export default function BuyersPage() {
  const { user } = useAuth();
  return (
    <>
      <Seo
        title="For buyers: acquire a regulated financial business"
        description="Register as a buyer to search approved opportunities, save listings, send confidential enquiries and submit an acquisition mandate."
      />
      <PageHeader
        eyebrow="For buyers"
        title="A clearer route to acquiring regulated businesses"
        description="Search approved, anonymised opportunities and tell us exactly what you are looking for. We focus on credible counterparties and realistic regulatory timelines."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Buyers' }]}
      >
        <div className="flex flex-wrap gap-3">
          {user ? (
            <ButtonLink to="/dashboard/mandates/new" variant="gold" size="lg">
              Submit an acquisition mandate
            </ButtonLink>
          ) : (
            <ButtonLink to="/register/buyer" variant="gold" size="lg">
              Register as a buyer
            </ButtonLink>
          )}
          <ButtonLink to="/marketplace" variant="outline-light" size="lg">
            Browse opportunities
          </ButtonLink>
        </div>
      </PageHeader>
      <Section>
        <SectionHeading eyebrow="Tools" title="Everything you need to run a disciplined search" />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
              <Icon className="h-6 w-6 text-gold-600" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="slate">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Who we work with</p>
            <h2 className="mt-3 text-3xl font-semibold">Buyers we typically support</h2>
            <ul className="mt-6 space-y-3">
              {BUYERS.map((b) => (
                <li key={b} className="flex gap-3 text-slate-700">
                  <Building className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">Before you enquire</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Regulators assess the suitability of new owners. Expect to provide information on ultimate beneficial
              owners, source of funds and wealth, management experience and your business plan for the target. Prepare
              this early. It is usually the critical path in a regulated acquisition.
            </p>
          </div>
        </div>
      </Section>
      <Section>
        <Disclaimer />
      </Section>
    </>
  );
}
