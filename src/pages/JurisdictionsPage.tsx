import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/layout/Section';
import { Seo } from '@/components/seo/Seo';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { useJurisdictions, useListingCounts } from '@/hooks/useReferenceData';

export default function JurisdictionsPage() {
  const { data: jurisdictions, isLoading, error, refetch } = useJurisdictions();
  const { data: counts } = useListingCounts();

  const regions = useMemo(() => {
    const map = new Map<string, NonNullable<typeof jurisdictions>>();
    for (const j of jurisdictions ?? []) {
      map.set(j.region, [...(map.get(j.region) ?? []), j]);
    }
    return [...map.entries()];
  }, [jurisdictions]);

  return (
    <>
      <Seo
        title="Jurisdictions"
        description="Browse regulated financial businesses and licences for sale by jurisdiction, including EU member states, the UK, Switzerland, the UAE, Singapore, Hong Kong and offshore financial centres."
      />
      <PageHeader
        eyebrow="Jurisdictions"
        title="Browse by jurisdiction"
        description="Regulatory regimes, change-of-control rules and licence portability differ significantly between jurisdictions. Explore opportunities by where the business is authorised."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Jurisdictions' }]}
      />
      <div className="container py-12 sm:py-16">
        {error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {regions.map(([region, list]) => (
              <section key={region} aria-labelledby={`region-${region}`}>
                <h2 id={`region-${region}`} className="text-2xl font-semibold">
                  {region}
                </h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((j) => {
                    const count = counts?.byJurisdiction.get(j.id) ?? 0;
                    return (
                      <li key={j.id}>
                        <Link
                          to={`/jurisdictions/${j.slug}`}
                          className="group flex h-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-gold-300 hover:shadow-lift"
                        >
                          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-lg font-semibold text-navy-900">{j.name}</span>
                            <span className="mt-1 line-clamp-2 block text-sm text-slate-600">{j.description}</span>
                            <span className="mt-3 block text-xs font-medium text-slate-500 tabular">
                              {count} {count === 1 ? 'opportunity' : 'opportunities'}
                            </span>
                          </span>
                          <ArrowRight
                            className="mt-1 h-4 w-4 text-slate-300 transition-colors group-hover:text-gold-600"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
