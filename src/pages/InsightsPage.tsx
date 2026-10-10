import { InsightCard } from '@/components/home/InsightsPreview';
import { PageHeader } from '@/components/layout/Section';
import { Seo } from '@/components/seo/Seo';
import { insights } from '@/content/insights';

export default function InsightsPage() {
  return (
    <>
      <Seo
        title="Insights on regulated financial M&A"
        description="Articles on licence transferability, change-of-control approvals, EMI and payment institution acquisitions, crypto-asset businesses after MiCA and platform verification."
      />
      <PageHeader
        eyebrow="Insights"
        title="Perspectives on regulated M&A"
        description="General information for buyers and sellers of regulated financial businesses. Not legal or regulatory advice."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Insights' }]}
      />
      <div className="container py-12 sm:py-16">
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {insights.map((i) => (
            <li key={i.slug}>
              <InsightCard insight={i} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
