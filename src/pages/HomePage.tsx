import { ArrowRight } from 'lucide-react';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedOpportunities } from '@/components/home/FeaturedOpportunities';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { InsightsPreview } from '@/components/home/InsightsPreview';
import { SellerCta } from '@/components/home/SellerCta';
import { TrustSection } from '@/components/home/TrustSection';
import { Disclaimer } from '@/components/layout/Disclaimer';
import { Section, SectionHeading } from '@/components/layout/Section';
import { Seo } from '@/components/seo/Seo';
import { ButtonLink } from '@/components/ui/button';
import { site } from '@/config/site';

export default function HomePage() {
  return (
    <>
      <Seo
        description={site.description}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: site.name,
          url: site.url || undefined,
          description: site.description,
        }}
      />
      <Hero />

      <Section aria-labelledby="categories-heading">
        <SectionHeading
          id="categories-heading"
          eyebrow="Asset categories"
          title="Ten categories of regulated and financial businesses"
          description="From fully licensed banks to payment infrastructure and iGaming operators, browse by the type of business or authorisation you want to acquire."
          action={
            <ButtonLink to="/categories" variant="outline">
              All categories <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          }
        />
        <CategoryGrid />
      </Section>

      <Section tone="slate" aria-labelledby="featured-heading">
        <SectionHeading
          id="featured-heading"
          eyebrow="Featured opportunities"
          title="Recently approved listings"
          description="Every listing has been approved by an administrator before publication. Verification states show only the checks an authorised reviewer has recorded."
          action={
            <ButtonLink to="/marketplace" variant="primary">
              Explore the marketplace <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          }
        />
        <FeaturedOpportunities />
      </Section>

      <Section aria-labelledby="trust-heading">
        <TrustSection />
      </Section>

      <Section tone="navy" aria-labelledby="how-heading">
        <SectionHeading
          id="how-heading"
          tone="light"
          eyebrow="How it works"
          title="A disciplined process for a regulated market"
          description="Acquisitions of regulated businesses take time and usually require regulatory approval. Our process is built around that reality."
        />
        <HowItWorks />
      </Section>

      <Section aria-label="Sell with Global Financial Assets">
        <SellerCta />
      </Section>

      <Section tone="slate" aria-labelledby="insights-heading">
        <SectionHeading
          id="insights-heading"
          eyebrow="Insights"
          title="Perspectives on regulated M&A"
          action={
            <ButtonLink to="/insights" variant="outline">
              All insights <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          }
        />
        <InsightsPreview />
      </Section>

      <Section className="pt-0 sm:pt-0">
        <Disclaimer className="mt-16 sm:mt-24" />
      </Section>
    </>
  );
}
