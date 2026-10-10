import { useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { SelfServiceRoleGate } from '@/components/auth/Guards';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { AssetCard } from '@/components/marketplace/AssetCard';
import { MandateStatusBadge } from '@/components/status/StatusBadges';
import { ButtonLink } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { useMandate, useMandateMatches } from '@/hooks/useDashboard';
import { useCategories, useJurisdictions } from '@/hooks/useReferenceData';
import { labelFor, TRANSACTION_TYPES } from '@/lib/constants';
import { formatMoney } from '@/lib/format';
import NotFoundPage from '../NotFoundPage';

function MandateDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: mandate, isLoading, error, refetch } = useMandate(id);
  const matches = useMandateMatches(mandate);
  const { data: categories } = useCategories();
  const { data: jurisdictions } = useJurisdictions();

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!mandate) return <NotFoundPage title="Mandate not found" />;

  const names = <T extends { id: string; name: string }>(ids: string[], list: T[] | undefined) =>
    ids.length ? ids.map((i) => list?.find((x) => x.id === i)?.name).filter(Boolean).join(', ') : 'Any';

  return (
    <div>
      <PanelHeader
        title={mandate.title}
        description={<MandateStatusBadge status={mandate.status} />}
        actions={
          <ButtonLink to={`/dashboard/mandates/${mandate.id}/edit`} variant="outline">
            <Pencil className="h-4 w-4" aria-hidden="true" /> Edit mandate
          </ButtonLink>
        }
      />
      <dl className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-6 text-sm shadow-card sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Categories</dt>
          <dd className="mt-0.5 font-medium">{names(mandate.category_ids, categories)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Jurisdictions</dt>
          <dd className="mt-0.5 font-medium">{names(mandate.jurisdiction_ids, jurisdictions)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Transaction types</dt>
          <dd className="mt-0.5 font-medium">
            {mandate.transaction_types.length
              ? mandate.transaction_types.map((t) => labelFor(TRANSACTION_TYPES, t)).join(', ')
              : 'Any'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Budget</dt>
          <dd className="mt-0.5 font-medium tabular">
            {mandate.min_budget != null ? formatMoney(mandate.min_budget, mandate.currency, false) : 'Any'} –{' '}
            {mandate.max_budget != null ? formatMoney(mandate.max_budget, mandate.currency, false) : 'Any'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Timeline</dt>
          <dd className="mt-0.5 font-medium">{mandate.timeline || '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Funding</dt>
          <dd className="mt-0.5 font-medium">{mandate.funding_source || '—'}</dd>
        </div>
        {mandate.requirements && (
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Requirements</dt>
            <dd className="mt-0.5 whitespace-pre-line">{mandate.requirements}</dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="matches-heading" className="mt-10">
        <h2 id="matches-heading" className="text-xl font-semibold">
          Matching published listings
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Budgets are compared using indicative EUR exchange rates. Price-on-request listings are included.
        </p>
        <div className="mt-5">
          {matches.error ? (
            <ErrorState error={matches.error} onRetry={() => matches.refetch()} />
          ) : matches.isLoading ? (
            <PageLoader label="Finding matches" />
          ) : matches.data && matches.data.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {matches.data.map((l) => (
                <li key={l.id}>
                  <AssetCard listing={l} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="No current matches"
              description="We will review new submissions against this mandate. You can widen your criteria at any time."
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default function MandateDetailPage() {
  return (
    <SelfServiceRoleGate role="buyer">
      <MandateDetail />
    </SelfServiceRoleGate>
  );
}
