import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Heart, MessagesSquare, Search, Target } from 'lucide-react';
import { PanelHeader, StatCard } from '@/components/dashboard/PanelLayout';
import { SubmissionStatusBadge } from '@/components/status/StatusBadges';
import { ButtonLink } from '@/components/ui/button';
import { Notice } from '@/components/ui/notice';
import { useAuth } from '@/hooks/useAuth';
import { useMyEnquiries, useMyMandates, useMySubmissions, useSavedListings } from '@/hooks/useDashboard';
import { formatDate } from '@/lib/format';

export default function DashboardOverviewPage() {
  const { profile, user, hasRole } = useAuth();
  const saved = useSavedListings();
  const enquiries = useMyEnquiries();
  const mandates = useMyMandates();
  const submissions = useMySubmissions();
  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <div>
      <PanelHeader
        title={firstName ? `Welcome, ${firstName}` : 'Welcome'}
        description={`Signed in as ${user?.email}. Your activity is private to you and authorised platform staff.`}
        actions={
          <ButtonLink to="/marketplace" variant="outline">
            <Search className="h-4 w-4" aria-hidden="true" /> Browse marketplace
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saved listings" value={saved.data?.length ?? '–'} />
        <StatCard label="Enquiries sent" value={enquiries.data?.length ?? '–'} />
        {hasRole('buyer') && (
          <StatCard label="Active mandates" value={mandates.data?.filter((m) => m.status === 'active').length ?? '–'} />
        )}
        {hasRole('seller') && <StatCard label="Submissions" value={submissions.data?.length ?? '–'} />}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card" aria-labelledby="quick-actions">
          <h2 id="quick-actions" className="text-lg font-semibold">
            Quick actions
          </h2>
          <ul className="mt-4 divide-y divide-slate-100">
            {[
              { to: '/dashboard/saved', icon: Heart, label: 'Review your shortlist', show: true },
              { to: '/dashboard/enquiries', icon: MessagesSquare, label: 'Track your enquiries', show: true },
              { to: '/dashboard/mandates/new', icon: Target, label: 'Register an acquisition mandate', show: hasRole('buyer') },
              { to: '/dashboard/submissions/new', icon: FileText, label: 'Start a confidential submission', show: hasRole('seller') },
            ]
              .filter((a) => a.show)
              .map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <Link to={to} className="group flex items-center justify-between py-3 text-sm font-medium text-navy-800">
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-gold-600" aria-hidden="true" />
                      {label}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-gold-600" aria-hidden="true" />
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        {hasRole('seller') ? (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card" aria-labelledby="recent-subs">
            <h2 id="recent-subs" className="text-lg font-semibold">
              Recent submissions
            </h2>
            {submissions.data && submissions.data.length > 0 ? (
              <ul className="mt-4 divide-y divide-slate-100">
                {submissions.data.slice(0, 4).map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <Link to={`/dashboard/submissions/${s.id}`} className="truncate font-medium text-navy-800 hover:underline">
                      {s.title}
                    </Link>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-slate-500">{formatDate(s.updated_at)}</span>
                      <SubmissionStatusBadge status={s.status} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No submissions yet.</p>
            )}
          </section>
        ) : (
          <Notice tone="info" title="Selling a business?">
            Enable seller access from your{' '}
            <Link to="/dashboard/profile" className="font-semibold underline underline-offset-2">
              profile
            </Link>{' '}
            to submit a business or licence for confidential review.
          </Notice>
        )}
      </div>
    </div>
  );
}
