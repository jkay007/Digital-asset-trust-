import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarCheck2,
  Check,
  FileText,
  Landmark,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { AssetCard } from '@/components/marketplace/AssetCard';
import { DemoBadge } from '@/components/marketplace/DemoBadge';
import { EnquiryForm } from '@/components/marketplace/EnquiryForm';
import { SaveButton } from '@/components/marketplace/SaveButton';
import { VerificationBadge } from '@/components/marketplace/VerificationBadge';
import { Disclaimer } from '@/components/layout/Disclaimer';
import { breadcrumbJsonLd, Seo } from '@/components/seo/Seo';
import { Badge } from '@/components/ui/badge';
import { Notice } from '@/components/ui/notice';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { useListing, useRelatedListings } from '@/hooks/useListings';
import { categoryIconBySlug } from '@/lib/category-meta';
import { labelFor, OPERATING_STATUSES, TRANSACTION_TYPES, VERIFICATION_LEVELS } from '@/lib/constants';
import { formatDate, formatPrice } from '@/lib/format';
import NotFoundPage from './NotFoundPage';

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-3 sm:grid sm:grid-cols-[13rem_1fr] sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-navy-900 sm:mt-0">{value ?? '—'}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading listing">
      <div className="bg-navy-900">
        <div className="container space-y-4 py-14">
          <Skeleton className="h-4 w-48 bg-white/10" />
          <Skeleton className="h-10 w-3/4 bg-white/10" />
          <Skeleton className="h-5 w-1/2 bg-white/10" />
        </div>
      </div>
      <div className="container grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export default function AssetDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: listing, isLoading, error, refetch } = useListing(slug);
  const related = useRelatedListings(listing);

  if (isLoading) return <DetailSkeleton />;
  if (error) {
    return (
      <div className="container py-16">
        <ErrorState error={error} onRetry={() => refetch()} />
      </div>
    );
  }
  if (!listing) {
    return (
      <NotFoundPage
        title="Listing not available"
        message="This listing may have been withdrawn, archived or not yet approved for publication."
      />
    );
  }

  const Icon = categoryIconBySlug(listing.category_slug);
  const verification = VERIFICATION_LEVELS.find((v) => v.value === listing.verification_status)!;
  const sold = listing.status === 'sold';
  const path = `/listings/${listing.slug}`;
  const description = listing.description?.split(/\n{2,}/).filter(Boolean) ?? [];

  return (
    <>
      <Seo
        title={listing.seo_title || `${listing.title} (${listing.reference_code})`}
        description={listing.seo_description || listing.summary}
        path={path}
        noindex={listing.is_demo}
        jsonLd={breadcrumbJsonLd([
          { name: 'Marketplace', path: '/marketplace' },
          { name: listing.category_name, path: `/categories/${listing.category_slug}` },
          { name: listing.title, path },
        ])}
      />

      <div className="on-dark relative overflow-hidden bg-navy-900 text-white">
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl" />
        <div className="container relative py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/55">
              <li>
                <Link to="/marketplace" className="inline-flex items-center gap-1 hover:text-gold-300">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Marketplace
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to={`/categories/${listing.category_slug}`} className="hover:text-gold-300">
                  {listing.category_name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white/80">
                {listing.reference_code}
              </li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            {listing.is_demo && <DemoBadge />}
            {sold && <Badge tone="danger">Sold</Badge>}
            <Badge tone="dark" className="tabular">
              Ref. {listing.reference_code}
            </Badge>
          </div>
          <div className="mt-5 flex items-start gap-5">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gold-400/40 bg-white/5 text-gold-300 sm:flex">
              <Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <h1 className="max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-[2.6rem]">
                {listing.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/70">{listing.summary}</p>
            </div>
          </div>
          <dl className="mt-10 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/50">Jurisdiction</dt>
              <dd className="mt-1 flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-gold-400" aria-hidden="true" />
                <Link to={`/jurisdictions/${listing.jurisdiction_slug}`} className="hover:text-gold-300">
                  {listing.jurisdiction_name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/50">Transaction</dt>
              <dd className="mt-1 font-medium">{labelFor(TRANSACTION_TYPES, listing.transaction_type)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/50">Asking price</dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-gold-300 tabular">
                {formatPrice(listing, { compact: false })}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/50">Verification</dt>
              <dd className="mt-1.5">
                <VerificationBadge level={listing.verification_status} isDemo={listing.is_demo} />
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="container py-10 sm:py-14">
        {listing.is_demo && (
          <Notice tone="demo" title="Demo listing: for illustration only" className="mb-8">
            This listing is fictitious and was created to demonstrate the platform. It does not describe a real business,
            it is not available for acquisition, and any verification state shown is illustrative only. No seller is
            associated with it.
          </Notice>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] xl:gap-14">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="overview-heading">
              <h2 id="overview-heading" className="text-2xl font-semibold">
                Overview
              </h2>
              <div className="mt-4 max-w-prose space-y-4 leading-relaxed text-slate-700">
                {description.length > 0 ? description.map((p, i) => <p key={i}>{p}</p>) : <p>{listing.summary}</p>}
              </div>
              {listing.highlights.length > 0 && (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {listing.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="deal-heading">
              <h2 id="deal-heading" className="text-2xl font-semibold">
                Deal information
              </h2>
              <dl className="mt-4 border-t border-slate-100">
                <Fact label="Reference" value={<span className="tabular">{listing.reference_code}</span>} />
                <Fact label="Category" value={listing.category_name} />
                <Fact label="Transaction type" value={labelFor(TRANSACTION_TYPES, listing.transaction_type)} />
                <Fact label="Operating status" value={labelFor(OPERATING_STATUSES, listing.operating_status)} />
                <Fact
                  label="Asking price"
                  value={
                    listing.price_on_request ? (
                      'Price on request'
                    ) : (
                      <span className="tabular">{formatPrice(listing, { compact: false })}</span>
                    )
                  }
                />
                <Fact label="Year established" value={listing.year_established} />
                <Fact label="Team size" value={listing.team_size} />
                <Fact label="Revenue range" value={listing.revenue_range} />
                <Fact label="Listed" value={formatDate(listing.published_at)} />
                {sold && <Fact label="Sold" value={formatDate(listing.sold_at)} />}
              </dl>
            </section>

            {listing.included_assets.length > 0 && (
              <section aria-labelledby="included-heading">
                <h2 id="included-heading" className="text-2xl font-semibold">
                  Included in the transaction
                </h2>
                <p className="mt-2 text-sm text-slate-500">As described by the seller; subject to confirmation in due diligence.</p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {listing.included_assets.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section aria-labelledby="licence-heading">
              <h2 id="licence-heading" className="text-2xl font-semibold">
                Licence &amp; regulator
              </h2>
              <dl className="mt-4 border-t border-slate-100">
                <Fact label="Licence / authorisation" value={listing.licence_type} />
                <Fact
                  label="Regulator"
                  value={
                    listing.regulator ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Landmark className="h-4 w-4 text-gold-600" aria-hidden="true" />
                        {listing.regulator}
                      </span>
                    ) : null
                  }
                />
                <Fact label="Jurisdiction" value={`${listing.jurisdiction_name} (${listing.jurisdiction_region})`} />
              </dl>
              <Notice tone="warning" title="Regulatory considerations" className="mt-5">
                Licences and authorisations are often not transferable and generally remain with the regulated entity.
                A change of ownership or control is likely to require prior approval from {listing.regulator || 'the competent regulator'},
                which may be refused, made subject to conditions or take several months. Confirm the current status on
                the regulator’s public register.
              </Notice>
            </section>

            <section aria-labelledby="verification-heading" className="rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-gold-600" aria-hidden="true" />
                <h2 id="verification-heading" className="text-xl font-semibold">
                  Verification
                </h2>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <VerificationBadge level={listing.verification_status} isDemo={listing.is_demo} size="md" />
                {listing.verified_at && listing.verification_status !== 'unverified' && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />
                    {listing.is_demo ? 'Illustrative date' : 'Recorded'} {formatDate(listing.verified_at)}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {listing.is_demo
                  ? 'Demo listing: this state is illustrative only and no verification has been performed.'
                  : listing.verification_status === 'unverified'
                    ? 'No independent checks have been recorded for this listing. Information is as provided by the seller.'
                    : `${verification.description} The state reflects the check recorded on the date shown and may since have changed.`}
              </p>
              <Link to="/verification" className="mt-3 inline-block text-sm font-semibold text-navy-800 underline-offset-2 hover:underline">
                What verification states mean
              </Link>
            </section>

            <Disclaimer />
          </div>

          <aside aria-label="Enquire about this opportunity" className="lg:row-span-2">
            <div className="space-y-5 lg:sticky lg:top-24">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <p className="text-xs uppercase tracking-wider text-slate-500">Asking price</p>
                <p className="mt-1 font-display text-3xl font-semibold text-navy-900 tabular">
                  {formatPrice(listing, { compact: false })}
                </p>
                {!listing.price_on_request && (
                  <p className="mt-1 text-xs text-slate-500">Indicative; subject to diligence and negotiation.</p>
                )}
                <SaveButton assetId={listing.id} title={listing.title} variant="full" className="mt-5 w-full" />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                <h2 className="font-display text-xl font-semibold">Confidential enquiry</h2>
                <p className="mb-5 mt-1.5 text-sm leading-relaxed text-slate-600">
                  Enquiries are received by our team, not sent directly to the seller.
                </p>
                <EnquiryForm assetId={listing.id} assetTitle={listing.title} isDemo={listing.is_demo} isSold={sold} />
              </div>
            </div>
          </aside>
        </div>

        <section aria-labelledby="related-heading" className="mt-20 border-t border-slate-200 pt-12">
          <h2 id="related-heading" className="text-2xl font-semibold">
            Related opportunities
          </h2>
          {related.error ? (
            <ErrorState className="mt-6" error={related.error} onRetry={() => related.refetch()} />
          ) : related.data && related.data.length > 0 ? (
            <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.data.map((r) => (
                <li key={r.id}>
                  <AssetCard listing={r} />
                </li>
              ))}
            </ul>
          ) : related.isLoading ? (
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              No related opportunities right now.{' '}
              <Link to="/marketplace" className="font-medium text-navy-800 underline underline-offset-2">
                Browse the marketplace
              </Link>
              .
            </p>
          )}
        </section>
      </div>
    </>
  );
}
