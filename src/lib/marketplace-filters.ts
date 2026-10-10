import type { OperatingStatus, TransactionType, VerificationLevel } from '@/integrations/supabase/types';
import { OPERATING_STATUSES, TRANSACTION_TYPES, VERIFICATION_LEVELS } from './constants';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'verified' | 'title';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'verified', label: 'Most recently verified' },
  { value: 'title', label: 'Title A–Z' },
];

export interface MarketplaceFilters {
  q: string;
  category: string | null; // category slug
  jurisdiction: string | null; // jurisdiction slug
  region: string | null;
  minPrice: number | null; // EUR equivalent
  maxPrice: number | null; // EUR equivalent
  types: TransactionType[];
  operating: OperatingStatus[];
  verification: VerificationLevel[];
  includeSold: boolean;
  sort: SortOption;
  page: number;
}

export const DEFAULT_FILTERS: MarketplaceFilters = {
  q: '',
  category: null,
  jurisdiction: null,
  region: null,
  minPrice: null,
  maxPrice: null,
  types: [],
  operating: [],
  verification: [],
  includeSold: false,
  sort: 'newest',
  page: 1,
};

const TYPE_VALUES = new Set(TRANSACTION_TYPES.map((t) => t.value));
const OPERATING_VALUES = new Set(OPERATING_STATUSES.map((t) => t.value));
const VERIFICATION_VALUES = new Set(VERIFICATION_LEVELS.map((t) => t.value));
const SORT_VALUES = new Set(SORT_OPTIONS.map((s) => s.value));

function list<T extends string>(raw: string | null, allowed: Set<T>): T[] {
  if (!raw) return [];
  return [...new Set(raw.split(',').map((s) => s.trim()))].filter((v): v is T => allowed.has(v as T));
}

function positiveNumber(raw: string | null): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const SLUG = /^[a-z0-9-]{1,80}$/;

/** Parses and sanitises URL search params into a filter object. Unknown values are dropped. */
export function parseFilters(params: URLSearchParams): MarketplaceFilters {
  const category = params.get('category');
  const jurisdiction = params.get('jurisdiction');
  const region = params.get('region');
  const sort = params.get('sort') as SortOption | null;
  const page = Math.floor(Number(params.get('page') ?? '1'));
  return {
    q: (params.get('q') ?? '').slice(0, 120),
    category: category && SLUG.test(category) ? category : null,
    jurisdiction: jurisdiction && SLUG.test(jurisdiction) ? jurisdiction : null,
    region: region ? region.slice(0, 60) : null,
    minPrice: positiveNumber(params.get('min')),
    maxPrice: positiveNumber(params.get('max')),
    types: list(params.get('type'), TYPE_VALUES),
    operating: list(params.get('operating'), OPERATING_VALUES),
    verification: list(params.get('verification'), VERIFICATION_VALUES),
    includeSold: params.get('sold') === '1',
    sort: sort && SORT_VALUES.has(sort) ? sort : 'newest',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Serialises filters to URL params, omitting defaults to keep URLs clean and shareable. */
export function filtersToParams(filters: MarketplaceFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.q.trim()) p.set('q', filters.q.trim());
  if (filters.category) p.set('category', filters.category);
  if (filters.jurisdiction) p.set('jurisdiction', filters.jurisdiction);
  if (filters.region) p.set('region', filters.region);
  if (filters.minPrice != null && filters.minPrice > 0) p.set('min', String(filters.minPrice));
  if (filters.maxPrice != null) p.set('max', String(filters.maxPrice));
  if (filters.types.length) p.set('type', filters.types.join(','));
  if (filters.operating.length) p.set('operating', filters.operating.join(','));
  if (filters.verification.length) p.set('verification', filters.verification.join(','));
  if (filters.includeSold) p.set('sold', '1');
  if (filters.sort !== 'newest') p.set('sort', filters.sort);
  if (filters.page > 1) p.set('page', String(filters.page));
  return p;
}

/** Number of active (non-default) filters, excluding sort and page. */
export function activeFilterCount(filters: MarketplaceFilters): number {
  let n = 0;
  if (filters.q.trim()) n++;
  if (filters.category) n++;
  if (filters.jurisdiction) n++;
  if (filters.region) n++;
  if (filters.minPrice != null && filters.minPrice > 0) n++;
  if (filters.maxPrice != null) n++;
  n += filters.types.length + filters.operating.length + filters.verification.length;
  if (filters.includeSold) n++;
  return n;
}

/**
 * Converts free text into a safe Postgres websearch query string. PostgREST's
 * `wfts` operator uses websearch_to_tsquery, which tolerates arbitrary input, but
 * we still strip characters that have no meaning for search.
 */
export function toSearchQuery(q: string): string {
  return q
    .replace(/[^\p{L}\p{N}\s"'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}
