import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import type { SellerSubmission } from '@/integrations/supabase/types';
import { useCategories, useJurisdictions } from '@/hooks/useReferenceData';
import { labelFor, OPERATING_STATUSES, TRANSACTION_TYPES } from '@/lib/constants';
import { formatDate, formatPrice } from '@/lib/format';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-slate-100 py-2.5 sm:grid sm:grid-cols-[12rem_1fr] sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm text-navy-900 sm:mt-0">{children || '—'}</dd>
    </div>
  );
}

/** Read-only view of a submission, including confidential fields (seller + staff only). */
export function SubmissionSummary({ submission: s }: { submission: SellerSubmission }) {
  const { data: categories } = useCategories();
  const { data: jurisdictions } = useJurisdictions();
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold">Listing information</h2>
        <dl className="mt-3">
          <Row label="Title">{s.title}</Row>
          <Row label="Category">{categories?.find((c) => c.id === s.category_id)?.name}</Row>
          <Row label="Jurisdiction">{jurisdictions?.find((j) => j.id === s.jurisdiction_id)?.name}</Row>
          <Row label="Transaction type">{s.transaction_type && labelFor(TRANSACTION_TYPES, s.transaction_type)}</Row>
          <Row label="Operating status">{s.operating_status && labelFor(OPERATING_STATUSES, s.operating_status)}</Row>
          <Row label="Asking price">{formatPrice(s, { compact: false })}</Row>
          <Row label="Licence type">{s.licence_type}</Row>
          <Row label="Regulator">{s.regulator}</Row>
          <Row label="Year established">{s.year_established}</Row>
          <Row label="Team size">{s.team_size}</Row>
          <Row label="Revenue range">{s.revenue_range}</Row>
          <Row label="Summary">{s.summary}</Row>
          <Row label="Description">{s.description}</Row>
          <Row label="Included assets">{s.included_assets.join('\n')}</Row>
          <Row label="Highlights">{s.highlights.join('\n')}</Row>
        </dl>
      </section>
      <section className="rounded-xl border border-gold-300 bg-gold-50/40 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Lock className="h-4 w-4 text-gold-700" aria-hidden="true" /> Confidential details
        </h2>
        <p className="mt-1 text-xs text-slate-600">Never published. Visible to the seller and authorised staff only.</p>
        <dl className="mt-3">
          <Row label="Company legal name">{s.company_legal_name}</Row>
          <Row label="Registration number">{s.registration_number}</Row>
          <Row label="Licence number">{s.licence_number}</Row>
          <Row label="Reason for sale">{s.reason_for_sale}</Row>
          <Row label="Contact name">{s.contact_name}</Row>
          <Row label="Contact email">{s.contact_email}</Row>
          <Row label="Contact phone">{s.contact_phone}</Row>
          <Row label="Seller declaration">{s.seller_declaration ? 'Confirmed' : 'Not confirmed'}</Row>
          <Row label="Submitted">{formatDate(s.submitted_at)}</Row>
        </dl>
      </section>
    </div>
  );
}
