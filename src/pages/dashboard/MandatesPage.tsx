import { Link } from 'react-router-dom';
import { Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SelfServiceRoleGate } from '@/components/auth/Guards';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { MandateStatusBadge } from '@/components/status/StatusBadges';
import { Button, ButtonLink } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState, errorMessage } from '@/components/ui/states';
import { useMyMandates } from '@/hooks/useDashboard';
import { useCategories } from '@/hooks/useReferenceData';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatMoney } from '@/lib/format';

function MandatesList() {
  const { data, isLoading, error, refetch } = useMyMandates();
  const { data: categories } = useCategories();
  const queryClient = useQueryClient();

  const remove = async (id: string) => {
    const { error: delError } = await supabase.from('buyer_mandates').delete().eq('id', id);
    if (delError) {
      toast.error(errorMessage(delError));
      throw delError;
    }
    toast.success('Mandate deleted');
    await queryClient.invalidateQueries({ queryKey: ['me'] });
  };

  return (
    <div>
      <PanelHeader
        title="Acquisition mandates"
        description="Describe what you want to acquire. Our team uses mandates to identify suitable opportunities, including ones that are not publicly listed."
        actions={
          <ButtonLink to="/dashboard/mandates/new">
            <Plus className="h-4 w-4" aria-hidden="true" /> New mandate
          </ButtonLink>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Target className="h-6 w-6" aria-hidden="true" />}
          title="No mandates yet"
          description="Register your first mandate to receive relevant introductions."
          action={<ButtonLink to="/dashboard/mandates/new">Create a mandate</ButtonLink>}
        />
      ) : (
        <ul className="space-y-4">
          {data.map((m) => {
            const catNames = m.category_ids
              .map((id) => categories?.find((c) => c.id === id)?.short_name)
              .filter(Boolean)
              .join(', ');
            return (
              <li key={m.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link to={`/dashboard/mandates/${m.id}`} className="font-display text-lg font-semibold text-navy-900 hover:underline">
                        {m.title}
                      </Link>
                      <MandateStatusBadge status={m.status} />
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">
                      {catNames || 'All categories'} · {m.jurisdiction_ids.length || 'All'} jurisdiction
                      {m.jurisdiction_ids.length === 1 ? '' : 's'} · Budget{' '}
                      {m.min_budget != null ? formatMoney(m.min_budget, m.currency) : 'any'} –{' '}
                      {m.max_budget != null ? formatMoney(m.max_budget, m.currency) : 'any'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Created {formatDate(m.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <ButtonLink to={`/dashboard/mandates/${m.id}`} variant="outline" size="sm">
                      View matches
                    </ButtonLink>
                    <ButtonLink to={`/dashboard/mandates/${m.id}/edit`} variant="ghost" size="sm" aria-label={`Edit ${m.title}`}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </ButtonLink>
                    <ConfirmDialog
                      title="Delete this mandate?"
                      description="This permanently removes the mandate. This cannot be undone."
                      confirmLabel="Delete mandate"
                      confirmVariant="danger"
                      onConfirm={() => remove(m.id)}
                      trigger={(open) => (
                        <Button variant="ghost" size="sm" onClick={open} aria-label={`Delete ${m.title}`}>
                          <Trash2 className="h-4 w-4 text-red-700" aria-hidden="true" />
                        </Button>
                      )}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function MandatesPage() {
  return (
    <SelfServiceRoleGate role="buyer">
      <MandatesList />
    </SelfServiceRoleGate>
  );
}
