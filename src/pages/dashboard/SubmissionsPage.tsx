import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { SelfServiceRoleGate } from '@/components/auth/Guards';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { AssetStatusBadge, SubmissionStatusBadge } from '@/components/status/StatusBadges';
import { ButtonLink } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Table, TableWrap, Td, Th, THead, Tr } from '@/components/ui/table';
import { useMyListings, useMySubmissions } from '@/hooks/useDashboard';
import { formatDate } from '@/lib/format';

function SubmissionsList() {
  const { data, isLoading, error, refetch } = useMySubmissions();
  const { data: listings } = useMyListings();
  const listingBySubmission = new Map((listings ?? []).map((l) => [l.submission_id, l]));

  return (
    <div>
      <PanelHeader
        title="Submissions"
        description="Drafts are private to you. Once submitted, our reviewers may request changes. Approved submissions become unpublished listings until an administrator publishes them."
        actions={
          <ButtonLink to="/dashboard/submissions/new">
            <Plus className="h-4 w-4" aria-hidden="true" /> New submission
          </ButtonLink>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" aria-hidden="true" />}
          title="No submissions yet"
          description="Start a confidential submission. You can save drafts and upload documents before submitting for review."
          action={<ButtonLink to="/dashboard/submissions/new">Start a submission</ButtonLink>}
        />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <Th>Submission</Th>
                <Th>Status</Th>
                <Th>Listing</Th>
                <Th>Updated</Th>
              </tr>
            </THead>
            <tbody>
              {data.map((s) => {
                const listing = listingBySubmission.get(s.id);
                return (
                  <Tr key={s.id}>
                    <Td>
                      <Link to={`/dashboard/submissions/${s.id}`} className="font-medium text-navy-800 hover:underline">
                        {s.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {[s.categories?.name, s.jurisdictions?.name].filter(Boolean).join(' · ') || 'Incomplete'}
                      </p>
                    </Td>
                    <Td>
                      <SubmissionStatusBadge status={s.status} />
                    </Td>
                    <Td>
                      {listing ? (
                        <div className="space-y-1">
                          <AssetStatusBadge status={listing.status} />
                          <p className="text-xs text-slate-500 tabular">{listing.reference_code}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </Td>
                    <Td className="whitespace-nowrap">{formatDate(s.updated_at)}</Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <SelfServiceRoleGate role="seller">
      <SubmissionsList />
    </SelfServiceRoleGate>
  );
}
