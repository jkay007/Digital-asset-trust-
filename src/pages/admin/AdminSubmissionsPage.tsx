import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { SubmissionStatusBadge } from '@/components/status/StatusBadges';
import { Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Table, TableWrap, Td, Th, THead, Tr } from '@/components/ui/table';
import { useAdminSubmissions } from '@/hooks/useAdmin';
import type { SubmissionStatus } from '@/integrations/supabase/types';
import { SUBMISSION_STATUSES } from '@/lib/constants';
import { formatDate } from '@/lib/format';

export default function AdminSubmissionsPage() {
  const [status, setStatus] = useState<SubmissionStatus | 'all' | 'queue'>('queue');
  const { data, isLoading, error, refetch } = useAdminSubmissions(status);
  return (
    <div>
      <PanelHeader
        title="Submissions"
        description="Review seller submissions. Approval creates an unpublished listing; publication is a separate step."
        actions={
          <div className="w-56">
            <label htmlFor="sub-status" className="sr-only">
              Filter by status
            </label>
            <Select id="sub-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="queue">Awaiting review</option>
              <option value="all">All statuses</option>
              {SUBMISSION_STATUSES.filter((s) => s.value !== 'draft').map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No submissions" description="No submissions match this filter." />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <Th>Submission</Th>
                <Th>Category / jurisdiction</Th>
                <Th>Submitted</Th>
                <Th>Status</Th>
              </tr>
            </THead>
            <tbody>
              {data
                .filter((s) => status !== 'all' || s.status !== 'draft')
                .map((s) => (
                  <Tr key={s.id}>
                    <Td>
                      <Link to={`/admin/submissions/${s.id}`} className="font-medium text-navy-800 hover:underline">
                        {s.title}
                      </Link>
                    </Td>
                    <Td className="text-xs">{[s.categories?.name, s.jurisdictions?.name].filter(Boolean).join(' · ') || '—'}</Td>
                    <Td className="whitespace-nowrap">{formatDate(s.submitted_at)}</Td>
                    <Td>
                      <SubmissionStatusBadge status={s.status} />
                    </Td>
                  </Tr>
                ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
      <p className="mt-3 text-xs text-slate-500">Seller drafts are private and are not shown here.</p>
    </div>
  );
}
