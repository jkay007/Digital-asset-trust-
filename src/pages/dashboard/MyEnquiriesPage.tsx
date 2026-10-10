import { Link } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { EnquiryStatusBadge } from '@/components/status/StatusBadges';
import { ButtonLink } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Table, TableWrap, Td, Th, THead, Tr } from '@/components/ui/table';
import { useMyEnquiries } from '@/hooks/useDashboard';
import { formatDate } from '@/lib/format';

export default function MyEnquiriesPage() {
  const { data, isLoading, error, refetch } = useMyEnquiries();
  return (
    <div>
      <PanelHeader
        title="My enquiries"
        description="Enquiries are reviewed by our team. Your details are not shared with sellers without your consent."
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="h-6 w-6" aria-hidden="true" />}
          title="No enquiries yet"
          description="Use the confidential enquiry form on a listing to express interest."
          action={<ButtonLink to="/marketplace">Browse the marketplace</ButtonLink>}
        />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <Th>Listing</Th>
                <Th>Sent</Th>
                <Th>NDA</Th>
                <Th>Status</Th>
              </tr>
            </THead>
            <tbody>
              {data.map((e) => (
                <Tr key={e.id}>
                  <Td>
                    {e.listing ? (
                      <Link to={`/listings/${e.listing.slug}`} className="font-medium text-navy-800 hover:underline">
                        {e.listing.title}
                      </Link>
                    ) : (
                      <span className="text-slate-500">Listing no longer published</span>
                    )}
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{e.message}</p>
                  </Td>
                  <Td className="whitespace-nowrap">{formatDate(e.created_at)}</Td>
                  <Td>{e.nda_requested ? 'Requested' : '—'}</Td>
                  <Td>
                    <EnquiryStatusBadge status={e.status} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}
