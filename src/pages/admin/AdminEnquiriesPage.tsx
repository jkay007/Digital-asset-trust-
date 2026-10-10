import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import { StaffNotesPanel } from '@/components/admin/StaffNotesPanel';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { EnquiryStatusBadge } from '@/components/status/StatusBadges';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { unwrap, useAdminAction, useAdminEnquiries } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import type { EnquiryStatus } from '@/integrations/supabase/types';
import { BUYER_TYPES, ENQUIRY_STATUSES } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import { AdminOnly } from './AdminLayout';

function Enquiries() {
  const [status, setStatus] = useState<EnquiryStatus | 'all'>('new');
  const [open, setOpen] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useAdminEnquiries(status);
  const setEnquiryStatus = useAdminAction(
    ({ id, next }: { id: string; next: EnquiryStatus }) => unwrap(supabase.from('enquiries').update({ status: next }).eq('id', id)),
    'Enquiry updated',
  );

  return (
    <div>
      <PanelHeader
        title="Enquiries"
        description="Buyer enquiries contain personal data and are visible to administrators only. Do not forward to sellers without the buyer’s consent."
        actions={
          <div className="w-52">
            <label htmlFor="enq-status" className="sr-only">
              Status
            </label>
            <Select id="enq-status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="all">All statuses</option>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        }
      />
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No enquiries" description="No enquiries match this filter." />
      ) : (
        <ul className="space-y-4">
          {data.map((e) => {
            const expanded = open === e.id;
            return (
              <li key={e.id} className="rounded-xl border border-slate-200 bg-white shadow-card">
                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy-900">{e.name}</p>
                      <EnquiryStatusBadge status={e.status} />
                      {e.nda_requested && <span className="text-xs font-medium text-gold-800">NDA requested</span>}
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {e.company || 'No company'} · {BUYER_TYPES.find((b) => b.value === e.buyer_type)?.label ?? 'Buyer type not given'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Re:{' '}
                      {e.assets ? (
                        <Link to={`/admin/listings/${e.asset_id}`} className="font-medium text-navy-800 hover:underline">
                          {e.assets.reference_code}: {e.assets.title}
                        </Link>
                      ) : (
                        'listing removed'
                      )}{' '}
                      · {formatDateTime(e.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <label htmlFor={`st-${e.id}`} className="sr-only">
                      Change status
                    </label>
                    <Select
                      id={`st-${e.id}`}
                      value={e.status}
                      onChange={(ev) => setEnquiryStatus.mutate({ id: e.id, next: ev.target.value as EnquiryStatus })}
                      className="h-9 w-40 text-sm"
                    >
                      {ENQUIRY_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => setOpen(expanded ? null : e.id)} aria-expanded={expanded}>
                      {expanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                      <span className="sr-only">{expanded ? 'Hide details' : 'Show details'}</span>
                    </Button>
                  </div>
                </div>
                {expanded && (
                  <div className="grid gap-6 border-t border-slate-100 p-5 lg:grid-cols-2">
                    <div className="space-y-3 text-sm">
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        <a href={`mailto:${e.email}`} className="text-navy-800 underline underline-offset-2">
                          {e.email}
                        </a>
                      </p>
                      {e.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" /> {e.phone}
                        </p>
                      )}
                      <p className="whitespace-pre-line rounded-lg bg-slate-50 p-4 text-slate-800">{e.message}</p>
                      <p className="text-xs text-slate-500">
                        {e.buyer_id ? 'Sent by a registered user.' : 'Sent without an account.'} Consent to the privacy notice recorded.
                      </p>
                    </div>
                    <StaffNotesPanel target={{ enquiry_id: e.id }} title="Enquiry notes" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function AdminEnquiriesPage() {
  return (
    <AdminOnly>
      <Enquiries />
    </AdminOnly>
  );
}
