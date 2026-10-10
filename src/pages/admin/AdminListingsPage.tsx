import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Star } from 'lucide-react';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { VerificationBadge } from '@/components/marketplace/VerificationBadge';
import { AssetStatusBadge } from '@/components/status/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Table, TableWrap, Td, Th, THead, Tr } from '@/components/ui/table';
import { useAdminAssets } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import type { AssetStatus } from '@/integrations/supabase/types';
import { ASSET_STATUSES } from '@/lib/constants';
import { formatDate, formatPrice } from '@/lib/format';

export default function AdminListingsPage() {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState<AssetStatus | 'all'>('all');
  const [q, setQ] = useState('');
  const { data, isLoading, error, refetch } = useAdminAssets({ status, q });

  return (
    <div>
      <PanelHeader
        title="Listings"
        description="All listings in every state. Only published and sold listings are visible to the public."
        actions={
          isAdmin && (
            <ButtonLink to="/admin/listings/new">
              <Plus className="h-4 w-4" aria-hidden="true" /> New listing
            </ButtonLink>
          )
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="admin-q" className="sr-only">
            Search listings
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input id="admin-q" className="pl-9" placeholder="Search title or reference" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="sm:w-56">
          <label htmlFor="admin-status" className="sr-only">
            Status
          </label>
          <Select id="admin-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="all">All statuses</option>
            {ASSET_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No listings" description="No listings match these filters." />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <Th>Listing</Th>
                <Th>Price</Th>
                <Th>Status</Th>
                <Th>Verification</Th>
                <Th>Updated</Th>
              </tr>
            </THead>
            <tbody>
              {data.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <Link to={`/admin/listings/${a.id}`} className="font-medium text-navy-800 hover:underline">
                      {a.title}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                      <span className="tabular">{a.reference_code}</span>·
                      <span>{[a.categories?.name, a.jurisdictions?.name].filter(Boolean).join(' · ')}</span>
                      {a.is_demo && <Badge tone="demo">Demo</Badge>}
                      {a.is_featured && (
                        <Badge tone="gold">
                          <Star className="h-3 w-3" aria-hidden="true" /> Featured
                        </Badge>
                      )}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap tabular">{formatPrice(a)}</Td>
                  <Td>
                    <AssetStatusBadge status={a.status} />
                  </Td>
                  <Td>
                    <VerificationBadge level={a.verification_status} isDemo={a.is_demo} />
                  </Td>
                  <Td className="whitespace-nowrap">{formatDate(a.updated_at)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}
