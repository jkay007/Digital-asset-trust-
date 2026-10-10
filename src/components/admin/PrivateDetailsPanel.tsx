import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { unwrap, useAdminAction, useAssetPrivateDetails } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';

const FIELDS = [
  ['company_legal_name', 'Company legal name'],
  ['registration_number', 'Registration number'],
  ['licence_number', 'Licence number'],
  ['registered_address', 'Registered address'],
  ['contact_name', 'Contact name'],
  ['contact_email', 'Contact email'],
  ['contact_phone', 'Contact phone'],
] as const;
type Key = (typeof FIELDS)[number][0] | 'internal_notes';

export function PrivateDetailsPanel({ assetId, canEdit }: { assetId: string; canEdit: boolean }) {
  const { data, isLoading } = useAssetPrivateDetails(assetId);
  const [values, setValues] = useState<Record<Key, string>>({} as Record<Key, string>);
  useEffect(() => {
    const next = {} as Record<Key, string>;
    for (const [k] of FIELDS) next[k] = (data?.[k] as string | null) ?? '';
    next.internal_notes = data?.internal_notes ?? '';
    setValues(next);
  }, [data]);

  const save = useAdminAction(async () => {
    const clean = (v: string | undefined) => v?.trim() || null;
    const row = {
      company_legal_name: clean(values.company_legal_name),
      registration_number: clean(values.registration_number),
      licence_number: clean(values.licence_number),
      registered_address: clean(values.registered_address),
      contact_name: clean(values.contact_name),
      contact_email: clean(values.contact_email),
      contact_phone: clean(values.contact_phone),
      internal_notes: clean(values.internal_notes),
    };
    if (data) {
      return unwrap(supabase.from('asset_private_details').update(row).eq('asset_id', assetId));
    }
    return unwrap(supabase.from('asset_private_details').insert({ asset_id: assetId, ...row }));
  }, 'Confidential details saved');

  return (
    <section className="rounded-xl border border-gold-300 bg-gold-50/40 p-6" aria-labelledby="private-heading">
      <h2 id="private-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Lock className="h-4 w-4 text-gold-700" aria-hidden="true" /> Confidential details
      </h2>
      <p className="mt-1 text-xs text-slate-600">Stored separately from the listing and never exposed through the public API.</p>
      {isLoading ? (
        <Skeleton className="mt-4 h-40" />
      ) : (
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(undefined);
          }}
        >
          <fieldset disabled={!canEdit} className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map(([key, label]) => (
              <Field key={key} label={label}>
                <Input value={values[key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
              </Field>
            ))}
            <Field label="Internal notes" className="sm:col-span-2">
              <Textarea rows={3} value={values.internal_notes ?? ''} onChange={(e) => setValues((v) => ({ ...v, internal_notes: e.target.value }))} />
            </Field>
          </fieldset>
          {canEdit && (
            <div className="flex justify-end">
              <Button type="submit" variant="outline" size="sm" loading={save.isPending}>
                Save confidential details
              </Button>
            </div>
          )}
        </form>
      )}
    </section>
  );
}
