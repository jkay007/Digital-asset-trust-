import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { BuyerMandate } from '@/integrations/supabase/types';
import { LISTING_CARD_COLUMNS, type ListingCard } from './useListings';
import { useAuth } from './useAuth';

/** Public listing cards for a set of asset ids (only published/sold ones resolve). */
export async function fetchListingCards(ids: string[]): Promise<ListingCard[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('marketplace_listings').select(LISTING_CARD_COLUMNS).in('id', ids);
  if (error) throw error;
  return (data ?? []) as ListingCard[];
}

export function useSavedListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'saved', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_listings')
        .select('asset_id, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const cards = await fetchListingCards((data ?? []).map((r) => r.asset_id));
      const byId = new Map(cards.map((c) => [c.id, c]));
      return (data ?? []).map((r) => ({ savedAt: r.created_at, assetId: r.asset_id, listing: byId.get(r.asset_id) ?? null }));
    },
  });
}

export function useMyEnquiries() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'enquiries', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enquiries')
        .select('id, asset_id, message, nda_requested, status, created_at')
        .eq('buyer_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const cards = await fetchListingCards([...new Set((data ?? []).map((e) => e.asset_id))]);
      const byId = new Map(cards.map((c) => [c.id, c]));
      return (data ?? []).map((e) => ({ ...e, listing: byId.get(e.asset_id) ?? null }));
    },
  });
}

export function useMyMandates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'mandates', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_mandates')
        .select('*')
        .eq('buyer_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMandate(id: string | undefined) {
  return useQuery({
    queryKey: ['me', 'mandate', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('buyer_mandates').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCurrencyRates() {
  return useQuery({
    queryKey: ['currency_rates'],
    staleTime: 60 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('currency_rates').select('currency, rate_to_eur');
      if (error) throw error;
      return new Map((data ?? []).map((r) => [r.currency, Number(r.rate_to_eur)]));
    },
  });
}

/** Published listings matching a mandate's criteria (budget compared in EUR equivalent). */
export function useMandateMatches(mandate: BuyerMandate | null | undefined) {
  const { data: rates } = useCurrencyRates();
  return useQuery({
    queryKey: ['me', 'mandate-matches', mandate?.id, mandate?.updated_at],
    enabled: Boolean(mandate && rates),
    queryFn: async () => {
      const m = mandate!;
      const rate = rates!.get(m.currency) ?? 1;
      let q = supabase.from('marketplace_listings').select(LISTING_CARD_COLUMNS).eq('status', 'published').limit(24);
      if (m.category_ids.length) q = q.in('category_id', m.category_ids);
      if (m.jurisdiction_ids.length) q = q.in('jurisdiction_id', m.jurisdiction_ids);
      if (m.transaction_types.length) q = q.in('transaction_type', m.transaction_types);
      if (m.min_budget != null) q = q.gte('asking_price_eur', Number(m.min_budget) * rate);
      if (m.max_budget != null) q = q.or(`asking_price_eur.lte.${Number(m.max_budget) * rate},price_on_request.eq.true`);
      const { data, error } = await q.order('published_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ListingCard[];
    },
  });
}

export function useMySubmissions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'submissions', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_submissions')
        .select('id, title, status, submitted_at, updated_at, feedback_to_seller, asset_id, categories(name), jurisdictions(name)')
        .eq('seller_id', user!.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Listings created from the seller's approved submissions (RLS: seller_id = caller). */
export function useMyListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'listings', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('id, title, slug, status, reference_code, verification_status, verified_at, published_at, submission_id')
        .eq('seller_id', user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSubmission(id: string | undefined) {
  return useQuery({
    queryKey: ['submission', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('seller_submissions').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSubmissionDocuments(submissionId: string | undefined) {
  return useQuery({
    queryKey: ['submission-documents', submissionId],
    enabled: Boolean(submissionId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submission_documents')
        .select('*')
        .eq('submission_id', submissionId!)
        .order('created_at');
      if (error) throw error;
      return data ?? [];
    },
  });
}
