import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { MandateStatusBadge } from '@/components/status/StatusBadges';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Table, TableWrap, Td, Th, THead, Tr } from '@/components/ui/table';
import { useAdminMandates } from '@/hooks/useAdmin';
import { useCategories } from '@/hooks/useReferenceData';
import { labelFor, TRANSACTION_TYPES } from '@/lib/constants';
import { formatDate, formatMoney } from '@/lib/format';
import { AdminOnly } from './AdminLayout';

function Mandates() {
  const { data, isLoading, error, refetch } = useAdminMandates();
  const { data: categories } = useCategories();
  return (
    <div>
      <PanelHeader title="Buyer mandates" description="Confidential acquisition criteria registered by buyers. Use them to identify suitable introductions." />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No mandates yet" />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <Th>Mandate</Th>
                <Th>Criteria</Th>
                <Th>Budget</Th>
                <Th>Status</Th>
                <Th>Created</Th>
              </tr>
            </THead>
            <tbody>
              {data.map((m) => (
                <Tr key={m.id}>
                  <Td className="font-medium text-navy-900">
                    {m.title}
                    {m.requirements && <p className="mt-1 line-clamp-2 text-xs font-normal text-slate-500">{m.requirements}</p>}
                  </Td>
                  <Td className="text-xs">
                    {m.category_ids.map((id) => categories?.find((c) => c.id === id)?.short_name).filter(Boolean).join(', ') || 'Any category'}
                    <br />
                    {m.transaction_types.map((t) => labelFor(TRANSACTION_TYPES, t)).join(', ') || 'Any structure'} ·{' '}
                    {m.jurisdiction_ids.length || 'Any'} jurisdictions
                  </Td>
                  <Td className="whitespace-nowrap tabular">
                    {m.min_budget != null ? formatMoney(m.min_budget, m.currency) : 'Any'} – {m.max_budget != null ? formatMoney(m.max_budget, m.currency) : 'Any'}
                  </Td>
                  <Td>
                    <MandateStatusBadge status={m.status} />
                  </Td>
                  <Td className="whitespace-nowrap">{formatDate(m.created_at)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}

export default function AdminMandatesPage() {
  return (
    <AdminOnly>
      <Mandates />
    </AdminOnly>
  );
}
