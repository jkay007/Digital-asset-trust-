import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ListingCard } from '@/hooks/useListings';
import { categoryIconBySlug } from '@/lib/category-meta';
import { labelFor, OPERATING_STATUSES, TRANSACTION_TYPES } from '@/lib/constants';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';
import { DemoBadge } from './DemoBadge';
import { SaveButton } from './SaveButton';
import { VerificationBadge } from './VerificationBadge';

interface AssetCardProps {
  listing: ListingCard;
  className?: string;
  headingLevel?: 'h2' | 'h3';
}

export function AssetCard({ listing, className, headingLevel = 'h3' }: AssetCardProps) {
  const Icon = categoryIconBySlug(listing.category_slug);
  const Heading = headingLevel;
  const sold = listing.status === 'sold';
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-lift',
        className,
      )}
    >
      <div className="relative flex items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-br from-navy-900 to-navy-700 px-5 py-4 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-400/40 bg-white/5 text-gold-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-gold-300">
              {listing.category_name}
            </p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-white/80">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {listing.jurisdiction_name}
            </p>
          </div>
        </div>
        <SaveButton assetId={listing.id} title={listing.title} className="relative z-10 shrink-0" />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {listing.is_demo && <DemoBadge />}
          {sold && <Badge tone="danger">Sold</Badge>}
          <span className="text-xs text-slate-500 tabular">{listing.reference_code}</span>
        </div>
        <Heading className="font-display text-lg font-semibold leading-snug text-navy-900">
          <Link
            to={`/listings/${listing.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:text-navy-700"
          >
            {listing.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{listing.summary}</p>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
          <div>
            <dt className="text-slate-500">Transaction</dt>
            <dd className="mt-0.5 font-medium text-navy-800">{labelFor(TRANSACTION_TYPES, listing.transaction_type)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="mt-0.5 font-medium text-navy-800">{labelFor(OPERATING_STATUSES, listing.operating_status)}</dd>
          </div>
          {listing.licence_type && (
            <div className="col-span-2">
              <dt className="text-slate-500">Licence</dt>
              <dd className="mt-0.5 truncate font-medium text-navy-800">{listing.licence_type}</dd>
            </div>
          )}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[0.7rem] uppercase tracking-wider text-slate-500">Asking price</p>
            <p className="mt-0.5 font-display text-xl font-semibold text-navy-900 tabular">{formatPrice(listing)}</p>
          </div>
          <ArrowUpRight
            className="h-5 w-5 text-slate-300 transition-colors group-hover:text-gold-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3">
          <VerificationBadge level={listing.verification_status} isDemo={listing.is_demo} />
        </div>
      </div>
    </article>
  );
}

export function AssetCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-hidden="true">
      <div className="flex items-center gap-3 bg-navy-900 px-5 py-4">
        <Skeleton className="h-10 w-10 bg-white/10" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 bg-white/10" />
          <Skeleton className="h-3 w-20 bg-white/10" />
        </div>
      </div>
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
        <Skeleton className="mt-4 h-7 w-32" />
      </div>
    </div>
  );
}
