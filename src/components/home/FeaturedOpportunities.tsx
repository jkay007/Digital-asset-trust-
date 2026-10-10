import { AssetCard, AssetCardSkeleton } from '@/components/marketplace/AssetCard';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { ButtonLink } from '@/components/ui/button';
import { useFeaturedListings } from '@/hooks/useListings';

export function FeaturedOpportunities() {
  const { data, isLoading, error, refetch } = useFeaturedListings(6);

  if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!isLoading && (!data || data.length === 0)) {
    return (
      <EmptyState
        title="No published opportunities yet"
        description="New listings appear here once they have been reviewed and approved by an administrator."
        action={
          <ButtonLink to="/sell" variant="outline">
            List a business
          </ButtonLink>
        }
      />
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading
        ? Array.from({ length: 6 }, (_, i) => (
            <li key={i}>
              <AssetCardSkeleton />
            </li>
          ))
        : data!.map((listing) => (
            <li key={listing.id}>
              <AssetCard listing={listing} />
            </li>
          ))}
    </ul>
  );
}
