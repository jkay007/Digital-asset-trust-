import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { VerificationBadge } from '@/components/marketplace/VerificationBadge';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input, Select, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { unwrap, useAdminAction, useVerificationRecords } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import type { VerificationLevel } from '@/integrations/supabase/types';
import { VERIFICATION_LEVELS, labelFor } from '@/lib/constants';
import { formatDate } from '@/lib/format';

const METHODS: Record<VerificationLevel, string> = {
  unverified: 'Verification withdrawn or lapsed',
  company_checked: 'Official companies register search',
  regulator_record_checked: 'Regulator public register search',
  documents_reviewed: 'Review of corporate and regulatory documents supplied by the seller',
};

interface VerificationPanelProps {
  assetId: string;
  current: VerificationLevel;
  verifiedAt: string | null;
  isDemo: boolean;
}

export function VerificationPanel({ assetId, current, verifiedAt, isDemo }: VerificationPanelProps) {
  const { user } = useAuth();
  const { data: records, isLoading } = useVerificationRecords(assetId);
  const today = new Date().toISOString().slice(0, 10);
  const [level, setLevel] = useState<VerificationLevel>('company_checked');
  const [method, setMethod] = useState(METHODS.company_checked);
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(today);
  const [error, setError] = useState<string | undefined>();

  const record = useAdminAction(
    () =>
      unwrap(
        supabase.from('verification_records').insert({
          asset_id: assetId,
          level,
          method: method.trim(),
          source_reference: source.trim() || null,
          notes: notes.trim() || null,
          checked_at: new Date(`${date}T12:00:00Z`).toISOString(),
        }),
      ),
    'Verification recorded',
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method.trim().length < 3) {
      setError('Describe the method used (at least 3 characters).');
      return;
    }
    setError(undefined);
    record.mutate(undefined, {
      onSuccess: () => {
        setSource('');
        setNotes('');
      },
    });
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card" aria-labelledby="verification-panel">
      <h2 id="verification-panel" className="flex items-center gap-2 text-lg font-semibold">
        <ShieldCheck className="h-5 w-5 text-gold-600" aria-hidden="true" /> Verification
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <VerificationBadge level={current} isDemo={isDemo} size="md" />
        {verifiedAt && <span className="text-sm text-slate-500">Recorded {formatDate(verifiedAt)}</span>}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        The public badge is derived from the latest record below. Records are permanent and attributed to you; record only
        checks you have actually performed.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Verification level" required>
            <Select
              value={level}
              onChange={(e) => {
                const next = e.target.value as VerificationLevel;
                setLevel(next);
                setMethod(METHODS[next]);
              }}
            >
              {VERIFICATION_LEVELS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date of check" required>
            <Input type="date" max={today} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        <Field label="Method" required error={error}>
          <Input value={method} maxLength={300} onChange={(e) => setMethod(e.target.value)} />
        </Field>
        <Field label="Source reference" hint="Register URL, extract reference or document name.">
          <Input value={source} maxLength={500} onChange={(e) => setSource(e.target.value)} />
        </Field>
        <Field label="Reviewer notes">
          <Textarea rows={3} value={notes} maxLength={5000} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={record.isPending}>
            Record verification
          </Button>
        </div>
      </form>

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500">History</h3>
      {isLoading ? (
        <Skeleton className="mt-3 h-12" />
      ) : records && records.length > 0 ? (
        <ol className="mt-3 space-y-3">
          {records.map((r) => (
            <li key={r.id} className="rounded-lg border border-slate-200 px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-navy-900">{labelFor(VERIFICATION_LEVELS, r.level)}</span>
                <span className="text-xs text-slate-500">
                  {formatDate(r.checked_at)} · {r.is_demo ? 'Demo record (no reviewer)' : r.reviewer_id === user?.id ? 'Recorded by you' : 'Authorised reviewer'}
                </span>
              </div>
              <p className="mt-1 text-slate-700">{r.method}</p>
              {r.source_reference && <p className="mt-1 break-all text-xs text-slate-500">Source: {r.source_reference}</p>}
              {r.notes && <p className="mt-1 whitespace-pre-line text-xs text-slate-600">{r.notes}</p>}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No verification records.</p>
      )}
    </section>
  );
}
