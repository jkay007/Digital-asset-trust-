import { useParams } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { MarketplaceBrowser } from '@/components/marketplace/MarketplaceBrowser';
import { Disclaimer } from '@/components/layout/Disclaimer';
import { PageHeader } from '@/components/layout/Section';
import { breadcrumbJsonLd, Seo } from '@/components/seo/Seo';
import { Notice } from '@/components/ui/notice';
import { PageLoader } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/states';
import { useJurisdictions, useListingCounts } from '@/hooks/useReferenceData';
import NotFoundPage from './NotFoundPage';

export default function JurisdictionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: jurisdictions, isLoading, error, refetch } = useJurisdictions();
  const { data: counts } = useListingCounts();

  if (isLoading) return <PageLoader />;
  if (error) return <div className="container py-16"><ErrorState error={error} onRetry={() => refetch()} /></div>;
  const jurisdiction = jurisdictions?.find((j) => j.slug === slug);
  if (!jurisdiction) return <NotFoundPage title="Jurisdiction not found" />;

  const count = counts?.byJurisdiction.get(jurisdiction.id) ?? 0;
  const path = `/jurisdictions/${jurisdiction.slug}`;

  return (
    <>
      <Seo
        title={jurisdiction.seo_title || `Financial businesses and licences for sale in ${jurisdiction.name}`}
        description={jurisdiction.seo_description || jurisdiction.description}
        path={path}
        jsonLd={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Jurisdictions', path: '/jurisdictions' },
          { name: jurisdiction.name, path },
        ])}
      />
      <PageHeader
        eyebrow={jurisdiction.region}
        title={`Opportunities in ${jurisdiction.name}`}
        description={
          <>
            <p>{jurisdiction.description}</p>
            <p className="mt-4 text-sm text-white/55 tabular">
              {count} published {count === 1 ? 'opportunity' : 'opportunities'}
            </p>
          </>
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Jurisdictions', href: '/jurisdictions' },
          { label: jurisdiction.name },
        ]}
      />
      <div className="container py-10 sm:py-14">
        {jurisdiction.regulator_summary && (
          <Notice tone="info" title="Regulatory context" className="mb-8">
            <span className="flex items-start gap-2">
              <Landmark className="sr-only" aria-hidden="true" />
              {jurisdiction.regulator_summary} Changes of control in regulated entities generally require prior
              approval. Confirm current requirements with qualified local advisers.
            </span>
          </Notice>
        )}
        <MarketplaceBrowser lockedJurisdiction={jurisdiction.slug} />
        <Disclaimer variant="compact" className="mt-14 border-t border-slate-200 pt-6" />
      </div>
    </>
  );
}
