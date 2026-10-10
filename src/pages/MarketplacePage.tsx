import { MarketplaceBrowser } from '@/components/marketplace/MarketplaceBrowser';
import { Disclaimer } from '@/components/layout/Disclaimer';
import { PageHeader } from '@/components/layout/Section';
import { Seo } from '@/components/seo/Seo';

export default function MarketplacePage() {
  return (
    <>
      <Seo
        title="Marketplace: regulated financial businesses for sale"
        description="Search approved listings of banks, EMIs, payment institutions, crypto-asset businesses, brokerages, investment firms, insurers and financial licences by category, jurisdiction, price and verification status."
      />
      <PageHeader
        eyebrow="Marketplace"
        title="Opportunities in regulated finance"
        description="Every listing below has been approved by an administrator before publication. Use the filters to narrow by category, jurisdiction, price, transaction type, operating status and verification state."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Marketplace' }]}
      />
      <div className="container py-10 sm:py-14">
        <MarketplaceBrowser />
        <Disclaimer variant="compact" className="mt-14 border-t border-slate-200 pt-6" />
      </div>
    </>
  );
}
