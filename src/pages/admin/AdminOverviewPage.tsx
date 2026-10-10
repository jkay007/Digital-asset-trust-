import { Link } from 'react-router-dom';
import { PanelHeader, StatCard } from '@/components/dashboard/PanelLayout';
import { SubmissionStatusBadge } from '@/components/status/StatusBadges';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';
import { useAdminStats, useAdminSubmissions } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/format';

export default function AdminOverviewPage() {
  const { isAdmin } = useAuth();
  const stats = useAdminStats();
  const queue = useAdminSubmissions('queue');
  const s = stats.data;
  return (
    <div>
      <PanelHeader title="Overview" description="Moderation queues and platform activity." />
      {stats.error ? (
        <ErrorState error={stats.error} onRetry={() => stats.refetch()} />
      ) : !s ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Awaiting review" value={(s.submissions.submitted ?? 0) + (s.submissions.under_review ?? 0)} hint="Submitted or under review" />
          <StatCard label="Approved, unpublished" value={s.assets.approved ?? 0} hint="Ready to publish" />
          <StatCard label="Published listings" value={s.assets.published ?? 0} />
          {isAdmin ? (
            <StatCard label="New enquiries" value={s.enquiries_new ?? 0} />
          ) : (
            <StatCard label="Sold" value={s.assets.sold ?? 0} />
          )}
          {isAdmin && (
            <>
              <StatCard label="Active mandates" value={s.mandates_active ?? 0} />
              <StatCard label="Registered users" value={s.users ?? 0} />
              <StatCard label="Changes requested" value={s.submissions.changes_requested ?? 0} />
              <StatCard label="Archived listings" value={s.assets.archived ?? 0} />
            </>
          )}
        </div>
      )}

      <section className="mt-10" aria-labelledby="queue-heading">
        <div className="flex items-center justify-between">
          <h2 id="queue-heading" className="text-xl font-semibold">
            Review queue
          </h2>
          <Link to="/admin/submissions" className="text-sm font-semibold text-navy-800 hover:underline">
            All submissions
          </Link>
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white shadow-card">
          {queue.isLoading ? (
            <Skeleton className="m-4 h-16" />
          ) : queue.data && queue.data.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {queue.data.slice(0, 8).map((sub) => (
                <li key={sub.id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
                  <Link to={`/admin/submissions/${sub.id}`} className="min-w-0 truncate font-medium text-navy-800 hover:underline">
                    {sub.title}
                  </Link>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-slate-500">{formatDate(sub.submitted_at)}</span>
                    <SubmissionStatusBadge status={sub.status} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-slate-500">Nothing awaiting review.</p>
          )}
        </div>
      </section>
    </div>
  );
}
