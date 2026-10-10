import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { errorMessage } from '@/components/ui/states';
import { supabase } from '@/integrations/supabase/client';
import type { AssetStatus, EnquiryStatus, Json, SubmissionStatus } from '@/integrations/supabase/types';

export interface AdminStats {
  submissions: Partial<Record<SubmissionStatus, number>>;
  assets: Partial<Record<AssetStatus, number>>;
  enquiries_new: number | null;
  mandates_active: number | null;
  users: number | null;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_dashboard_stats');
      if (error) throw error;
      return data as unknown as AdminStats;
    },
  });
}

export function useAdminSubmissions(status: SubmissionStatus | 'all' | 'queue') {
  return useQuery({
    queryKey: ['admin', 'submissions', status],
    queryFn: async () => {
      let q = supabase
        .from('seller_submissions')
        .select('id, title, status, submitted_at, updated_at, seller_id, asset_id, categories(name), jurisdictions(name)')
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false });
      if (status === 'queue') q = q.in('status', ['submitted', 'under_review']);
      else if (status !== 'all') q = q.eq('status', status);
      const { data, error } = await q.limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminAssets(filters: { status: AssetStatus | 'all'; q: string }) {
  return useQuery({
    queryKey: ['admin', 'assets', filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      let q = supabase
        .from('assets')
        .select(
          'id, reference_code, slug, title, status, verification_status, verified_at, is_demo, is_featured, published_at, updated_at, asking_price, currency, price_on_request, categories(name), jurisdictions(name)',
        )
        .order('updated_at', { ascending: false })
        .limit(200);
      if (filters.status !== 'all') q = q.eq('status', filters.status);
      const term = filters.q.trim().replace(/[%,()]/g, ' ');
      if (term) q = q.or(`title.ilike.%${term}%,reference_code.ilike.%${term}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminAsset(id: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'asset', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('*').eq('id', id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useAssetPrivateDetails(assetId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'asset-private', assetId],
    enabled: Boolean(assetId),
    queryFn: async () => {
      const { data, error } = await supabase.from('asset_private_details').select('*').eq('asset_id', assetId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useVerificationRecords(assetId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'verification', assetId],
    enabled: Boolean(assetId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('verification_records')
        .select('*')
        .eq('asset_id', assetId!)
        .order('checked_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type NoteTarget = { submission_id: string } | { asset_id: string } | { enquiry_id: string };

export function useStaffNotes(target: NoteTarget | null) {
  const [key, value] = target ? Object.entries(target)[0]! : ['none', ''];
  return useQuery({
    queryKey: ['admin', 'notes', key, value],
    enabled: Boolean(target),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_notes')
        .select('*')
        .eq(key as 'submission_id', value)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminEnquiries(status: EnquiryStatus | 'all') {
  return useQuery({
    queryKey: ['admin', 'enquiries', status],
    queryFn: async () => {
      let q = supabase
        .from('enquiries')
        .select('*, assets(title, reference_code, slug, status)')
        .order('created_at', { ascending: false })
        .limit(200);
      if (status !== 'all') q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminMandates() {
  return useQuery({
    queryKey: ['admin', 'mandates'],
    queryFn: async () => {
      const { data, error } = await supabase.from('buyer_mandates').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_users');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export const AUDIT_PAGE_SIZE = 50;

export function useAuditLogs(filters: { entity: string; page: number }) {
  return useQuery({
    queryKey: ['admin', 'audit', filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      let q = supabase.from('audit_logs').select('*', { count: 'exact' }).order('id', { ascending: false });
      if (filters.entity !== 'all') q = q.eq('entity_type', filters.entity);
      const from = (filters.page - 1) * AUDIT_PAGE_SIZE;
      const { data, error, count } = await q.range(from, from + AUDIT_PAGE_SIZE - 1);
      if (error) throw error;
      return { rows: data ?? [], total: count ?? 0 };
    },
  });
}

/** Generic mutation wrapper: runs fn, toasts, invalidates admin + public caches. */
export function useAdminAction<TArgs>(fn: (args: TArgs) => Promise<unknown>, success: string | ((args: TArgs) => string)) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async (_data, args) => {
      toast.success(typeof success === 'function' ? success(args) : success);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['listings'] }),
        queryClient.invalidateQueries({ queryKey: ['listing'] }),
        queryClient.invalidateQueries({ queryKey: ['listing_counts'] }),
        queryClient.invalidateQueries({ queryKey: ['submission'] }),
        queryClient.invalidateQueries({ queryKey: ['page_metadata'] }),
      ]);
    },
    onError: (err) => {
      toast.error(errorMessage(err));
    },
  });
}

/** Throws PostgREST errors so mutations surface them. */
export async function unwrap<T>(promise: PromiseLike<{ data: T; error: unknown }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
}

export function auditDetails(details: Json): string {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return '';
  return Object.entries(details)
    .map(([k, v]) => {
      if (v && typeof v === 'object' && !Array.isArray(v) && 'from' in v && 'to' in v) {
        return `${k}: ${JSON.stringify((v as { from: Json }).from)} → ${JSON.stringify((v as { to: Json }).to)}`;
      }
      return `${k}: ${JSON.stringify(v)}`;
    })
    .join('; ');
}
