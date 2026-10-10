import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { VerificationBadge } from '@/components/marketplace/VerificationBadge';
import { AssetStatusBadge } from '@/components/status/StatusBadges';
import { Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Table, TableWrap, Td, Th, THead, Tr } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import type { VerificationLevel } from '@/integrations/supabase/types';
import { VERIFICATION_LEVELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';

export default function AdminVerificationPage() {
  const [level, setLevel] = useState<VerificationLevel | 'all'>('unverified');
  const [includeDemo, setIncludeDemo] = useState(false);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'verification-queue', level, includeDemo],
    queryFn: async () => {
      let q = supabase
        .from('assets')
        .select('id, title, reference_code, status, verification_status, verified_at, is_demo')
        .in('status', ['approved', 'published', 'pending_review', 'draft'])
        .order('verified_at', { ascending: true, nullsFirst: true })
        .limit(200);
      if (level !== 'all') q = q.eq('verification_status', level);
      if (!includeDemo) q = q.eq('is_demo', false);
      const { data: rows, error: e } = await q;
      if (e) throw e;
      return rows ?? [];
    },
  });

  return (
    <div>
      <PanelHeader
        title="Verification"
        description="Listings ordered by the age of their last verification. Open a listing to record a new check."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={includeDemo} onChange={(e) => setIncludeDemo(e.target.checked)} className="accent-navy-900" />
              Include demo listings
            </label>
            <div className="w-60">
              <label htmlFor="ver-level" className="sr-only">
                Verification level
              </label>
              <Select id="ver-level" value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
                <option value="all">All levels</option>
                {VERIFICATION_LEVELS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Nothing to verify" description="No listings match this filter." />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <Th>Listing</Th>
                <Th>Status</Th>
                <Th>Verification</Th>
                <Th>Last checked</Th>
              </tr>
            </THead>
            <tbody>
              {data.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <Link to={`/admin/listings/${a.id}`} className="font-medium text-navy-800 hover:underline">
                      {a.title}
                    </Link>
                    <p className="text-xs text-slate-500 tabular">{a.reference_code}</p>
                  </Td>
                  <Td>
                    <AssetStatusBadge status={a.status} />
                  </Td>
                  <Td>
                    <VerificationBadge level={a.verification_status} isDemo={a.is_demo} />
                  </Td>
                  <Td className="whitespace-nowrap">{formatDate(a.verified_at)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}
