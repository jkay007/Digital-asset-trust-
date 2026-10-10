import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

/** IDs of listings the current user has saved. RLS limits rows to the caller. */
export function useSavedIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['me', 'saved-ids', user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await supabase.from('saved_listings').select('asset_id');
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.asset_id));
    },
  });
}

export function useToggleSaved() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ assetId, saved }: { assetId: string; saved: boolean }) => {
      if (!user) throw new Error('Please sign in to save listings.');
      if (saved) {
        const { error } = await supabase.from('saved_listings').delete().eq('asset_id', assetId).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('saved_listings').insert({ asset_id: assetId });
        if (error) throw error;
      }
      return !saved;
    },
    onSuccess: (nowSaved) => {
      toast.success(nowSaved ? 'Saved to your shortlist' : 'Removed from your shortlist');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
