import { Link, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { ListingContentForm, type ListingPayload } from '@/components/admin/ListingContentForm';
import { ListingStatusActions } from '@/components/admin/ListingStatusActions';
import { PrivateDetailsPanel } from '@/components/admin/PrivateDetailsPanel';
import { StaffNotesPanel } from '@/components/admin/StaffNotesPanel';
import { VerificationPanel } from '@/components/admin/VerificationPanel';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { AssetStatusBadge } from '@/components/status/StatusBadges';
import { Badge } from '@/components/ui/badge';
import { Notice } from '@/components/ui/notice';
import { PageLoader } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/states';
import { unwrap, useAdminAction, useAdminAsset } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDateTime } from '@/lib/format';
import NotFoundPage from '../NotFoundPage';

function NewListing() {
  const navigate = useNavigate();
  const create = useAdminAction(
    (payload: ListingPayload) => unwrap(supabase.from('assets').insert(payload).select('id').single()),
    'Draft listing created',
  );
  return (
    <div>
      <PanelHeader
        title="New listing"
        description="Listings created here start as unpublished drafts. They must be approved and then published by an administrator."
      />
      <ListingContentForm
        submitLabel="Create draft listing"
        onSave={async (payload) => {
          const row = (await create.mutateAsync(payload)) as { id: string };
          navigate(`/admin/listings/${row.id}`, { replace: true });
        }}
      />
    </div>
  );
}

function ExistingListing({ id }: { id: string }) {
  const { isAdmin } = useAuth();
  const { data: asset, isLoading, error, refetch } = useAdminAsset(id);
  const update = useAdminAction(
    (payload: ListingPayload) => unwrap(supabase.from('assets').update(payload).eq('id', id)),
    'Listing content saved',
  );

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!asset) return <NotFoundPage title="Listing not found" />;

  const isPublic = asset.status === 'published' || asset.status === 'sold';

  return (
    <div className="space-y-6">
      <PanelHeader
        title={asset.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <AssetStatusBadge status={asset.status} />
            <span className="text-xs text-slate-500 tabular">{asset.reference_code}</span>
            {asset.is_demo && <Badge tone="demo">Demo listing</Badge>}
            {asset.submission_id && (
              <Link to={`/admin/submissions/${asset.submission_id}`} className="text-xs font-semibold text-navy-800 underline underline-offset-2">
                Source submission
              </Link>
            )}
          </span>
        }
        actions={
          isPublic && (
            <Link to={`/listings/${asset.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:underline">
              View public page <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          )
        }
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card" aria-labelledby="lifecycle-heading">
        <h2 id="lifecycle-heading" className="text-lg font-semibold">
          Publication
        </h2>
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-slate-500 sm:grid-cols-4">
          <div>
            <dt className="inline">Approved: </dt>
            <dd className="inline">{formatDateTime(asset.approved_at)}</dd>
          </div>
          <div>
            <dt className="inline">Published: </dt>
            <dd className="inline">{formatDateTime(asset.published_at)}</dd>
          </div>
          <div>
            <dt className="inline">Archived: </dt>
            <dd className="inline">{formatDateTime(asset.archived_at)}</dd>
          </div>
          <div>
            <dt className="inline">Sold: </dt>
            <dd className="inline">{formatDateTime(asset.sold_at)}</dd>
          </div>
        </dl>
        <div className="mt-4">
          {isAdmin ? (
            <ListingStatusActions assetId={asset.id} status={asset.status} />
          ) : (
            <p className="text-sm text-slate-500">Status changes require an administrator.</p>
          )}
        </div>
        {asset.status === 'approved' && (
          <Notice tone="info" className="mt-4">
            Approved but not public. Check the content, confidential details and verification state before publishing.
          </Notice>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <ListingContentForm asset={asset} readOnly={!isAdmin} submitLabel="Save content" onSave={(p) => update.mutateAsync(p)} />
          <PrivateDetailsPanel assetId={asset.id} canEdit={isAdmin} />
        </div>
        <div className="space-y-6">
          <VerificationPanel assetId={asset.id} current={asset.verification_status} verifiedAt={asset.verified_at} isDemo={asset.is_demo} />
          <StaffNotesPanel target={{ asset_id: asset.id }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminListingPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  if (!id || id === 'new') {
    return isAdmin ? <NewListing /> : <Notice tone="warning">Only administrators can create listings.</Notice>;
  }
  return <ExistingListing id={id} />;
}
