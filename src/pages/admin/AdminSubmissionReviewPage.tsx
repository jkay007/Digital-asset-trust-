import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, MessageSquareWarning, PlayCircle, XCircle } from 'lucide-react';
import { StaffNotesPanel } from '@/components/admin/StaffNotesPanel';
import { DocumentsPanel } from '@/components/dashboard/DocumentsPanel';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { SubmissionSummary } from '@/components/dashboard/SubmissionSummary';
import { SubmissionStatusBadge } from '@/components/status/StatusBadges';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Notice } from '@/components/ui/notice';
import { PageLoader } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/states';
import { unwrap, useAdminAction } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { useSubmission } from '@/hooks/useDashboard';
import { supabase } from '@/integrations/supabase/client';
import { formatDateTime } from '@/lib/format';
import NotFoundPage from '../NotFoundPage';

export default function AdminSubmissionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: s, isLoading, error, refetch } = useSubmission(id);

  const startReview = useAdminAction(
    () => unwrap(supabase.rpc('start_submission_review', { p_submission_id: id! })),
    'Moved into review',
  );
  const requestChanges = useAdminAction(
    (feedback: string) => unwrap(supabase.rpc('request_submission_changes', { p_submission_id: id!, p_feedback: feedback })),
    'Changes requested from the seller',
  );
  const reject = useAdminAction(
    (reason: string) => unwrap(supabase.rpc('reject_submission', { p_submission_id: id!, p_reason: reason })),
    'Submission rejected',
  );
  const approve = useAdminAction(
    (note: string) => unwrap(supabase.rpc('approve_submission', { p_submission_id: id!, p_note: note || null })),
    'Approved: unpublished listing created',
  );

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!s) return <NotFoundPage title="Submission not found" />;

  const awaiting = s.status === 'submitted' || s.status === 'under_review';

  return (
    <div className="space-y-6">
      <PanelHeader
        title={s.title}
        description={
          <span className="flex flex-wrap items-center gap-3">
            <SubmissionStatusBadge status={s.status} />
            <span className="text-xs text-slate-500">Last updated {formatDateTime(s.updated_at)}</span>
          </span>
        }
      />

      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        {s.status === 'submitted' && (
          <Button variant="outline" onClick={() => startReview.mutate(undefined)} loading={startReview.isPending}>
            <PlayCircle className="h-4 w-4" aria-hidden="true" /> Start review
          </Button>
        )}
        {awaiting && (
          <ConfirmDialog
            title="Request changes"
            description="The seller will see this feedback and can edit and resubmit."
            confirmLabel="Send feedback"
            input={{ label: 'Feedback to the seller', required: true, minLength: 10 }}
            onConfirm={(text) => requestChanges.mutateAsync(text)}
            trigger={(open) => (
              <Button variant="outline" onClick={open}>
                <MessageSquareWarning className="h-4 w-4" aria-hidden="true" /> Request changes
              </Button>
            )}
          />
        )}
        {isAdmin && awaiting && (
          <ConfirmDialog
            title="Approve submission"
            description="An unpublished listing will be created from this submission. Confidential details are stored separately and are never published. You can review and publish the listing next."
            confirmLabel="Approve"
            input={{ label: 'Internal note (optional)' }}
            onConfirm={async (note) => {
              const assetId = await approve.mutateAsync(note);
              navigate(`/admin/listings/${assetId as string}`);
            }}
            trigger={(open) => (
              <Button onClick={open}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Approve
              </Button>
            )}
          />
        )}
        {isAdmin && (awaiting || s.status === 'changes_requested') && (
          <ConfirmDialog
            title="Reject submission"
            description="The seller will see the reason. This cannot be undone; the seller may submit again."
            confirmLabel="Reject"
            confirmVariant="danger"
            input={{ label: 'Reason shown to the seller', required: true, minLength: 10 }}
            onConfirm={(text) => reject.mutateAsync(text)}
            trigger={(open) => (
              <Button variant="danger-outline" onClick={open}>
                <XCircle className="h-4 w-4" aria-hidden="true" /> Reject
              </Button>
            )}
          />
        )}
        {!isAdmin && awaiting && (
          <p className="self-center text-xs text-slate-500">Approval and rejection require an administrator.</p>
        )}
        {s.asset_id && (
          <Link to={`/admin/listings/${s.asset_id}`} className="self-center text-sm font-semibold text-navy-800 underline underline-offset-2">
            Open the listing created from this submission
          </Link>
        )}
        {!awaiting && !s.asset_id && <p className="self-center text-sm text-slate-500">No actions available in this state.</p>}
      </div>

      {s.feedback_to_seller && (
        <Notice tone="warning" title="Feedback sent to seller">
          <p className="whitespace-pre-line">{s.feedback_to_seller}</p>
        </Notice>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SubmissionSummary submission={s} />
          <DocumentsPanel submissionId={s.id} editable={false} />
        </div>
        <div>
          <StaffNotesPanel target={{ submission_id: s.id }} />
        </div>
      </div>
    </div>
  );
}
