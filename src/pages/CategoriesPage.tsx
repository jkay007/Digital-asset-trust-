import { CategoryGrid } from '@/components/home/CategoryGrid';
import { PageHeader } from '@/components/layout/Section';
import { Seo } from '@/components/seo/Seo';

export default function CategoriesPage() {
  return (
    <>
      <Seo
        title="Asset categories"
        description="Browse regulated financial businesses for sale by category: banks, EMIs and payment institutions, crypto and digital assets, financial licences, forex and brokerage, investment firms, iGaming, payment infrastructure, insurance and more."
      />
      <PageHeader
        eyebrow="Categories"
        title="Browse by type of business"
        description="Ten categories covering the main types of regulated and financial businesses traded on the platform."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
      />
      <div className="container py-12 sm:py-16">
        <CategoryGrid className="xl:grid-cols-4" />
      </div>
    </>
  );
}
