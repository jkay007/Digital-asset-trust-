import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';

const STALE = 10 * 60_000;

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    enabled: isSupabaseConfigured,
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useJurisdictions() {
  return useQuery({
    queryKey: ['jurisdictions'],
    enabled: isSupabaseConfigured,
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await supabase.from('jurisdictions').select('*').order('sort_order').order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Published listing counts per category and jurisdiction (computed server-side). */
export function useListingCounts() {
  return useQuery({
    queryKey: ['listing_counts'],
    enabled: isSupabaseConfigured,
    staleTime: 2 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('listing_counts');
      if (error) throw error;
      const byCategory = new Map<string, number>();
      const byJurisdiction = new Map<string, number>();
      for (const row of data ?? []) {
        (row.kind === 'category' ? byCategory : byJurisdiction).set(row.ref_id, Number(row.listing_count));
      }
      return { byCategory, byJurisdiction };
    },
  });
}
