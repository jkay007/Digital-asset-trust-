import { Heart } from 'lucide-react';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { AssetCard, AssetCardSkeleton } from '@/components/marketplace/AssetCard';
import { SaveButton } from '@/components/marketplace/SaveButton';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { useSavedListings } from '@/hooks/useDashboard';

export default function SavedListingsPage() {
  const { data, isLoading, error, refetch } = useSavedListings();
  return (
    <div>
      <PanelHeader title="Saved listings" description="Your private shortlist. Sellers are not notified when you save a listing." />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <AssetCardSkeleton />
          <AssetCardSkeleton />
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-6 w-6" aria-hidden="true" />}
          title="No saved listings yet"
          description="Use the heart icon on any listing to add it to your shortlist."
          action={<ButtonLink to="/marketplace">Browse the marketplace</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {data.map((row) =>
            row.listing ? (
              <li key={row.assetId}>
                <AssetCard listing={row.listing} headingLevel="h2" />
              </li>
            ) : (
              <li key={row.assetId} className="flex flex-col justify-between rounded-xl border border-dashed border-slate-300 bg-white p-6">
                <div>
                  <p className="font-semibold text-navy-900">Listing no longer available</p>
                  <p className="mt-1 text-sm text-slate-600">It has been withdrawn or archived.</p>
                </div>
                <SaveButton assetId={row.assetId} title="this listing" variant="full" className="mt-4" />
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}
