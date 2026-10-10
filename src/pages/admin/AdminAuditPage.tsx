import { useState } from 'react';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { Select } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { Table, TableWrap, Td, Th, THead, Tr } from '@/components/ui/table';
import { AUDIT_PAGE_SIZE, auditDetails, useAuditLogs } from '@/hooks/useAdmin';
import { formatDateTime } from '@/lib/format';
import { AdminOnly } from './AdminLayout';

const ENTITIES = [
  'assets',
  'seller_submissions',
  'verification_records',
  'submission_documents',
  'enquiries',
  'user_roles',
  'user',
  'buyer_mandates',
  'page_metadata',
  'categories',
  'jurisdictions',
  'staff_notes',
  'asset_private_details',
];

function Audit() {
  const [entity, setEntity] = useState('all');
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching } = useAuditLogs({ entity, page });
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / AUDIT_PAGE_SIZE));
  return (
    <div>
      <PanelHeader
        title="Audit log"
        description="Append-only record of moderation, verification, role, document-access and data changes. Confidential values are never copied into the log."
        actions={
          <div className="w-60">
            <label htmlFor="audit-entity" className="sr-only">
              Entity type
            </label>
            <Select
              id="audit-entity"
              value={entity}
              onChange={(e) => {
                setEntity(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All entities</option>
              {ENTITIES.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </Select>
          </div>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <>
          <TableWrap className={isFetching ? 'opacity-70' : undefined}>
            <Table>
              <THead>
                <tr>
                  <Th>When</Th>
                  <Th>Action</Th>
                  <Th>Entity</Th>
                  <Th>Actor</Th>
                  <Th>Details</Th>
                </tr>
              </THead>
              <tbody>
                {data?.rows.map((row) => (
                  <Tr key={row.id}>
                    <Td className="whitespace-nowrap text-xs">{formatDateTime(row.created_at)}</Td>
                    <Td className="font-mono text-xs">{row.action}</Td>
                    <Td className="text-xs">
                      {row.entity_type}
                      {row.entity_id && <span className="block font-mono text-[0.7rem] text-slate-400">{row.entity_id.slice(0, 13)}</span>}
                    </Td>
                    <Td className="font-mono text-[0.7rem] text-slate-500">{row.actor_id ? row.actor_id.slice(0, 8) : 'system'}</Td>
                    <Td className="max-w-md break-words text-xs text-slate-600">{auditDetails(row.details)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
          <Pagination className="mt-6" page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminAuditPage() {
  return (
    <AdminOnly>
      <Audit />
    </AdminOnly>
  );
}
