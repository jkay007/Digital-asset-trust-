import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import type { Listing } from '@/integrations/supabase/types';
import { PAGE_SIZE } from '@/lib/constants';
import { toSearchQuery, type MarketplaceFilters } from '@/lib/marketplace-filters';

/** Public listing columns. The view only exposes whitelisted, non-confidential fields. */
export const LISTING_CARD_COLUMNS =
  'id,reference_code,slug,title,summary,category_id,category_slug,category_name,jurisdiction_id,jurisdiction_slug,jurisdiction_name,jurisdiction_region,transaction_type,operating_status,asking_price,currency,price_on_request,asking_price_eur,licence_type,regulator,verification_status,verified_at,status,is_demo,is_featured,published_at,sold_at';

export const LISTING_DETAIL_COLUMNS = `${LISTING_CARD_COLUMNS},description,year_established,team_size,revenue_range,included_assets,highlights,seo_title,seo_description`;

export type ListingCard = Pick<
  Listing,
  | 'id'
  | 'reference_code'
  | 'slug'
  | 'title'
  | 'summary'
  | 'category_id'
  | 'category_slug'
  | 'category_name'
  | 'jurisdiction_id'
  | 'jurisdiction_slug'
  | 'jurisdiction_name'
  | 'jurisdiction_region'
  | 'transaction_type'
  | 'operating_status'
  | 'asking_price'
  | 'currency'
  | 'price_on_request'
  | 'asking_price_eur'
  | 'licence_type'
  | 'regulator'
  | 'verification_status'
  | 'verified_at'
  | 'status'
  | 'is_demo'
  | 'is_featured'
  | 'published_at'
  | 'sold_at'
>;

export interface ListingPage {
  rows: ListingCard[];
  total: number;
  pageCount: number;
}

export async function fetchListings(filters: MarketplaceFilters, pageSize = PAGE_SIZE): Promise<ListingPage> {
  let query = supabase.from('marketplace_listings').select(LISTING_CARD_COLUMNS, { count: 'exact' });

  query = filters.includeSold ? query.in('status', ['published', 'sold']) : query.eq('status', 'published');
  if (filters.category) query = query.eq('category_slug', filters.category);
  if (filters.jurisdiction) query = query.eq('jurisdiction_slug', filters.jurisdiction);
  if (filters.region) query = query.eq('jurisdiction_region', filters.region);
  if (filters.types.length) query = query.in('transaction_type', filters.types);
  if (filters.operating.length) query = query.in('operating_status', filters.operating);
  if (filters.verification.length) query = query.in('verification_status', filters.verification);
  if (filters.minPrice != null && filters.minPrice > 0) query = query.gte('asking_price_eur', filters.minPrice);
  if (filters.maxPrice != null) query = query.lte('asking_price_eur', filters.maxPrice);

  const search = toSearchQuery(filters.q);
  if (search) query = query.textSearch('search_vector', search, { type: 'websearch', config: 'english' });

  switch (filters.sort) {
    case 'price_asc':
      query = query.order('asking_price_eur', { ascending: true, nullsFirst: false });
      break;
    case 'price_desc':
      query = query.order('asking_price_eur', { ascending: false, nullsFirst: false });
      break;
    case 'verified':
      query = query.order('verified_at', { ascending: false, nullsFirst: false });
      break;
    case 'title':
      query = query.order('title', { ascending: true });
      break;
    default:
      query = query.order('published_at', { ascending: false, nullsFirst: false });
  }
  query = query.order('id', { ascending: true }); // stable pagination

  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);
  if (error) {
    // Requesting a page past the end returns 416 / PGRST103: treat as empty.
    if (error.code === 'PGRST103') return { rows: [], total: count ?? 0, pageCount: Math.ceil((count ?? 0) / pageSize) };
    throw error;
  }
  const total = count ?? 0;
  return { rows: (data ?? []) as ListingCard[], total, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export function useMarketplaceListings(filters: MarketplaceFilters) {
  return useQuery({
    queryKey: ['listings', filters],
    enabled: isSupabaseConfigured,
    placeholderData: keepPreviousData,
    queryFn: () => fetchListings(filters),
  });
}

export function useFeaturedListings(limit = 6) {
  return useQuery({
    queryKey: ['listings', 'featured', limit],
    enabled: isSupabaseConfigured,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(LISTING_CARD_COLUMNS)
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as ListingCard[];
    },
  });
}

export type ListingDetail = Omit<Listing, 'search_vector'>;

export function useListing(slug: string | undefined) {
  return useQuery({
    queryKey: ['listing', slug],
    enabled: isSupabaseConfigured && Boolean(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(LISTING_DETAIL_COLUMNS)
        .eq('slug', slug!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as ListingDetail | null;
    },
  });
}

export function useRelatedListings(listing: Pick<Listing, 'id' | 'category_id' | 'jurisdiction_id'> | null | undefined) {
  return useQuery({
    queryKey: ['listings', 'related', listing?.id],
    enabled: isSupabaseConfigured && Boolean(listing),
    queryFn: async () => {
      const base = () =>
        supabase
          .from('marketplace_listings')
          .select(LISTING_CARD_COLUMNS)
          .eq('status', 'published')
          .neq('id', listing!.id)
          .order('published_at', { ascending: false, nullsFirst: false })
          .limit(3);
      const sameCategory = await base().eq('category_id', listing!.category_id);
      if (sameCategory.error) throw sameCategory.error;
      const rows = (sameCategory.data ?? []) as ListingCard[];
      if (rows.length < 3) {
        const sameJurisdiction = await base().eq('jurisdiction_id', listing!.jurisdiction_id);
        if (sameJurisdiction.error) throw sameJurisdiction.error;
        for (const r of (sameJurisdiction.data ?? []) as ListingCard[]) {
          if (rows.length >= 3) break;
          if (!rows.some((x) => x.id === r.id)) rows.push(r);
        }
      }
      return rows;
    },
  });
}
