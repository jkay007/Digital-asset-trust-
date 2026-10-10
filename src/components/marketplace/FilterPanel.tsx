import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox, Select } from '@/components/ui/input';
import { useCategories, useJurisdictions, useListingCounts } from '@/hooks/useReferenceData';
import { OPERATING_STATUSES, PRICE_BANDS, TRANSACTION_TYPES, VERIFICATION_LEVELS } from '@/lib/constants';
import type { MarketplaceFilters } from '@/lib/marketplace-filters';
import { cn } from '@/lib/utils';
import { VerificationBadge } from './VerificationBadge';

interface FilterPanelProps {
  filters: MarketplaceFilters;
  onChange: (patch: Partial<MarketplaceFilters>) => void;
  onReset: () => void;
  hideCategory?: boolean;
  hideJurisdiction?: boolean;
  idPrefix?: string;
  className?: string;
}

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-slate-200 pt-5">
      <legend className="float-left mb-3 w-full text-xs font-semibold uppercase tracking-[0.14em] text-navy-700">
        {legend}
      </legend>
      <div className="clear-both space-y-2.5">{children}</div>
    </fieldset>
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  hideCategory,
  hideJurisdiction,
  idPrefix = 'f',
  className,
}: FilterPanelProps) {
  const { data: categories } = useCategories();
  const { data: jurisdictions } = useJurisdictions();
  const { data: counts } = useListingCounts();

  const byRegion = useMemo(() => {
    const groups = new Map<string, NonNullable<typeof jurisdictions>>();
    for (const j of jurisdictions ?? []) {
      const list = groups.get(j.region) ?? [];
      list.push(j);
      groups.set(j.region, list);
    }
    return [...groups.entries()];
  }, [jurisdictions]);

  const id = (s: string) => `${idPrefix}-${s}`;

  return (
    <div className={cn('space-y-5', className)}>
      {!hideCategory && (
        <div className="space-y-1.5">
          <label htmlFor={id('category')} className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-700">
            Category
          </label>
          <Select
            id={id('category')}
            value={filters.category ?? ''}
            onChange={(e) => onChange({ category: e.target.value || null })}
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name} ({counts?.byCategory.get(c.id) ?? 0})
              </option>
            ))}
          </Select>
        </div>
      )}

      {!hideJurisdiction && (
        <div className="space-y-1.5">
          <label
            htmlFor={id('jurisdiction')}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-700"
          >
            Jurisdiction
          </label>
          <Select
            id={id('jurisdiction')}
            value={filters.jurisdiction ?? ''}
            onChange={(e) => onChange({ jurisdiction: e.target.value || null })}
          >
            <option value="">All jurisdictions</option>
            {byRegion.map(([region, list]) => (
              <optgroup key={region} label={region}>
                {list.map((j) => (
                  <option key={j.id} value={j.slug}>
                    {j.name} ({counts?.byJurisdiction.get(j.id) ?? 0})
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </div>
      )}

      <FilterGroup legend="Price range (EUR equivalent)">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor={id('min')} className="sr-only">
              Minimum price
            </label>
            <Select
              id={id('min')}
              value={filters.minPrice != null ? String(filters.minPrice) : '0'}
              onChange={(e) => onChange({ minPrice: Number(e.target.value) || null })}
            >
              {PRICE_BANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.value === '0' ? 'Min: any' : `Min ${b.label}`}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor={id('max')} className="sr-only">
              Maximum price
            </label>
            <Select
              id={id('max')}
              value={filters.maxPrice != null ? String(filters.maxPrice) : ''}
              onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Max: any</option>
              {PRICE_BANDS.filter((b) => b.value !== '0').map((b) => (
                <option key={b.value} value={b.value}>
                  Max {b.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        {(filters.minPrice || filters.maxPrice != null) && (
          <p className="text-xs leading-relaxed text-slate-500">
            Listings with price on request are excluded when a price range is set.
          </p>
        )}
        {filters.minPrice != null && filters.maxPrice != null && filters.minPrice > filters.maxPrice && (
          <p role="alert" className="text-xs font-medium text-red-700">
            Minimum price is higher than maximum price.
          </p>
        )}
      </FilterGroup>

      <FilterGroup legend="Transaction type">
        {TRANSACTION_TYPES.map((t) => (
          <label key={t.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <Checkbox
              checked={filters.types.includes(t.value)}
              onChange={() => onChange({ types: toggle(filters.types, t.value) })}
            />
            {t.label}
          </label>
        ))}
      </FilterGroup>

      <FilterGroup legend="Operating status">
        {OPERATING_STATUSES.map((s) => (
          <label key={s.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <Checkbox
              checked={filters.operating.includes(s.value)}
              onChange={() => onChange({ operating: toggle(filters.operating, s.value) })}
            />
            {s.label}
          </label>
        ))}
      </FilterGroup>

      <FilterGroup legend="Verification status">
        {VERIFICATION_LEVELS.map((v) => (
          <label key={v.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <Checkbox
              checked={filters.verification.includes(v.value)}
              onChange={() => onChange({ verification: toggle(filters.verification, v.value) })}
            />
            <VerificationBadge level={v.value} />
          </label>
        ))}
      </FilterGroup>

      <FilterGroup legend="Availability">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
          <Checkbox checked={filters.includeSold} onChange={() => onChange({ includeSold: !filters.includeSold })} />
          Include sold listings
        </label>
      </FilterGroup>

      <Button variant="outline" className="w-full" onClick={onReset}>
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset filters
      </Button>
    </div>
  );
}
