import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { AssetCard, AssetCardSkeleton } from './AssetCard';
import { FilterPanel } from './FilterPanel';
import { Button, ButtonLink } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { useMarketplaceListings } from '@/hooks/useListings';
import { useCategories, useJurisdictions } from '@/hooks/useReferenceData';
import {
  OPERATING_STATUSES,
  PAGE_SIZE,
  TRANSACTION_TYPES,
  VERIFICATION_LEVELS,
  labelFor,
} from '@/lib/constants';
import { formatMoney } from '@/lib/format';
import {
  activeFilterCount,
  filtersToParams,
  parseFilters,
  SORT_OPTIONS,
  type MarketplaceFilters,
  type SortOption,
} from '@/lib/marketplace-filters';
import { cn } from '@/lib/utils';

interface MarketplaceBrowserProps {
  lockedCategory?: string;
  lockedJurisdiction?: string;
  /** Heading level for result cards (h2 on the marketplace page, h3 under a section heading). */
  cardHeading?: 'h2' | 'h3';
}

interface Chip {
  key: string;
  label: string;
  remove: Partial<MarketplaceFilters>;
}

export function MarketplaceBrowser({ lockedCategory, lockedJurisdiction, cardHeading = 'h2' }: MarketplaceBrowserProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { data: categories } = useCategories();
  const { data: jurisdictions } = useJurisdictions();

  const urlFilters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const filters = useMemo<MarketplaceFilters>(
    () => ({
      ...urlFilters,
      category: lockedCategory ?? urlFilters.category,
      jurisdiction: lockedJurisdiction ?? urlFilters.jurisdiction,
    }),
    [urlFilters, lockedCategory, lockedJurisdiction],
  );

  const [keyword, setKeyword] = useState(filters.q);
  // Last keyword pushed to the URL from typing; prevents the URL sync below from
  // overwriting characters typed while the debounced update was in flight.
  const pushedKeyword = useRef(filters.q);
  useEffect(() => {
    if (urlFilters.q !== pushedKeyword.current) {
      pushedKeyword.current = urlFilters.q;
      setKeyword(urlFilters.q);
    }
  }, [urlFilters.q]);

  const update = useCallback(
    (patch: Partial<MarketplaceFilters>, opts: { keepPage?: boolean } = {}) => {
      const next: MarketplaceFilters = { ...urlFilters, ...patch };
      if (!opts.keepPage) next.page = 1;
      if (lockedCategory) next.category = null;
      if (lockedJurisdiction) next.jurisdiction = null;
      setSearchParams(filtersToParams(next));
    },
    [urlFilters, lockedCategory, lockedJurisdiction, setSearchParams],
  );

  const reset = useCallback(() => {
    setKeyword('');
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Debounce keyword typing into the URL.
  useEffect(() => {
    if (keyword === urlFilters.q) return;
    const t = window.setTimeout(() => {
      pushedKeyword.current = keyword;
      update({ q: keyword });
    }, 400);
    return () => window.clearTimeout(t);
  }, [keyword, urlFilters.q, update]);

  const { data, isLoading, isFetching, error, refetch } = useMarketplaceListings(filters);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    pushedKeyword.current = keyword;
    update({ q: keyword });
  };

  const goToPage = (page: number) => {
    update({ page }, { keepPage: true });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const chips: Chip[] = [];
  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”`, remove: { q: '' } });
  if (filters.category && !lockedCategory) {
    chips.push({
      key: 'category',
      label: categories?.find((c) => c.slug === filters.category)?.name ?? filters.category,
      remove: { category: null },
    });
  }
  if (filters.jurisdiction && !lockedJurisdiction) {
    chips.push({
      key: 'jurisdiction',
      label: jurisdictions?.find((j) => j.slug === filters.jurisdiction)?.name ?? filters.jurisdiction,
      remove: { jurisdiction: null },
    });
  }
  if (filters.region) chips.push({ key: 'region', label: filters.region, remove: { region: null } });
  if (filters.minPrice) chips.push({ key: 'min', label: `From ${formatMoney(filters.minPrice)}`, remove: { minPrice: null } });
  if (filters.maxPrice != null) chips.push({ key: 'max', label: `Up to ${formatMoney(filters.maxPrice)}`, remove: { maxPrice: null } });
  filters.types.forEach((t) =>
    chips.push({ key: `t-${t}`, label: labelFor(TRANSACTION_TYPES, t), remove: { types: filters.types.filter((x) => x !== t) } }),
  );
  filters.operating.forEach((s) =>
    chips.push({ key: `o-${s}`, label: labelFor(OPERATING_STATUSES, s), remove: { operating: filters.operating.filter((x) => x !== s) } }),
  );
  filters.verification.forEach((v) =>
    chips.push({
      key: `v-${v}`,
      label: labelFor(VERIFICATION_LEVELS, v),
      remove: { verification: filters.verification.filter((x) => x !== v) },
    }),
  );
  if (filters.includeSold) chips.push({ key: 'sold', label: 'Including sold', remove: { includeSold: false } });

  const activeCount = activeFilterCount(urlFilters);
  const total = data?.total ?? 0;
  const first = total === 0 ? 0 : (filters.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(filters.page * PAGE_SIZE, total);

  const panel = (prefix: string) => (
    <FilterPanel
      idPrefix={prefix}
      filters={filters}
      onChange={(patch) => update(patch)}
      onReset={reset}
      hideCategory={Boolean(lockedCategory)}
      hideJurisdiction={Boolean(lockedJurisdiction)}
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr] xl:gap-10">
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="mb-5 font-display text-lg font-semibold">Refine results</h2>
          {panel('desktop')}
        </div>
      </aside>

      <div ref={resultsRef} className="min-w-0 scroll-mt-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form role="search" onSubmit={onSearch} className="relative flex-1">
            <label htmlFor="market-q" className="sr-only">
              Search opportunities
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="market-q"
              type="search"
              value={keyword}
              maxLength={120}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by keyword, licence, regulator or reference"
              className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-[0.95rem] shadow-sm placeholder:text-slate-400 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
            />
          </form>
          <div className="flex gap-3">
            <Button variant="outline" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-haspopup="dialog">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {activeCount > 0 && (
                <span className="rounded-full bg-navy-900 px-1.5 text-xs text-white tabular">{activeCount}</span>
              )}
            </Button>
            <div className="w-full sm:w-56">
              <label htmlFor="market-sort" className="sr-only">
                Sort by
              </label>
              <Select
                id="market-sort"
                value={filters.sort}
                onChange={(e) => update({ sort: e.target.value as SortOption })}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2" aria-live="polite">
          <p className="mr-2 text-sm text-slate-600">
            {isLoading ? (
              'Loading opportunities…'
            ) : (
              <>
                Showing <span className="font-semibold text-navy-900 tabular">{first}</span>–
                <span className="font-semibold text-navy-900 tabular">{last}</span> of{' '}
                <span className="font-semibold text-navy-900 tabular">{total}</span>{' '}
                {total === 1 ? 'opportunity' : 'opportunities'}
              </>
            )}
          </p>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => {
                if (chip.key === 'q') setKeyword('');
                update(chip.remove);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-navy-200 bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-800 hover:border-navy-400"
              aria-label={`Remove filter: ${chip.label}`}
            >
              {chip.label}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
          {chips.length > 0 && (
            <button type="button" onClick={reset} className="text-xs font-semibold text-gold-800 underline-offset-2 hover:underline">
              Reset all
            </button>
          )}
        </div>

        <div className={cn('mt-6 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
          {error ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : isLoading ? (
            <ul className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3" aria-busy="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <AssetCardSkeleton />
                </li>
              ))}
            </ul>
          ) : data && data.rows.length > 0 ? (
            <ul className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {data.rows.map((listing) => (
                <li key={listing.id}>
                  <AssetCard listing={listing} headingLevel={cardHeading} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No opportunities match these filters"
              description="Try widening the price range, removing a filter, or register an acquisition mandate so we can notify you when a matching business is listed."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" onClick={reset}>
                    Reset filters
                  </Button>
                  <ButtonLink to="/dashboard/mandates/new">Register a mandate</ButtonLink>
                </div>
              }
            />
          )}
        </div>

        {data && data.pageCount > 1 && (
          <Pagination className="mt-10" page={filters.page} pageCount={data.pageCount} onPageChange={goToPage} />
        )}
      </div>

      <DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy-950/60 lg:hidden" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl focus:outline-none lg:hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <DialogPrimitive.Title className="font-display text-lg font-semibold">Filters</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">Refine marketplace results</DialogPrimitive.Description>
              <DialogPrimitive.Close className="rounded-md p-2 hover:bg-slate-100" aria-label="Close filters">
                <X className="h-5 w-5" aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{panel('mobile')}</div>
            <div className="border-t border-slate-200 p-4">
              <Button className="w-full" onClick={() => setMobileOpen(false)}>
                Show {total} {total === 1 ? 'result' : 'results'}
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
