import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { CheckboxField, Field } from '@/components/ui/field';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { errorMessage } from '@/components/ui/states';
import { useCategories, useJurisdictions } from '@/hooks/useReferenceData';
import type { Asset, OperatingStatus, TablesInsert, TransactionType } from '@/integrations/supabase/types';
import { CURRENCIES, OPERATING_STATUSES, TRANSACTION_TYPES } from '@/lib/constants';

const listLines = (max: number) =>
  z
    .string()
    .optional()
    .transform((v) =>
      (v ?? '')
        .split('\n')
        .map((s) => s.trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, max),
    );

const schema = z
  .object({
    title: z.string().trim().min(5, 'At least 5 characters').max(160),
    summary: z.string().trim().min(20, 'At least 20 characters').max(400),
    description: z.string().trim().max(10000),
    category_id: z.string().min(1, 'Select a category'),
    jurisdiction_id: z.string().min(1, 'Select a jurisdiction'),
    transaction_type: z.string().min(1, 'Select a transaction type'),
    operating_status: z.string().min(1, 'Select an operating status'),
    asking_price: z.string().trim().refine((v) => !v || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0), 'Enter a positive amount'),
    currency: z.enum(CURRENCIES),
    price_on_request: z.boolean(),
    licence_type: z.string().trim().max(200),
    regulator: z.string().trim().max(200),
    year_established: z.string().trim().refine((v) => !v || /^\d{4}$/.test(v), 'Four-digit year'),
    team_size: z.string().trim().max(60),
    revenue_range: z.string().trim().max(60),
    included_assets: listLines(30),
    highlights: listLines(12),
    is_featured: z.boolean(),
    seo_title: z.string().trim().max(120),
    seo_description: z.string().trim().max(320),
  })
  .refine((v) => v.price_on_request || v.asking_price, { path: ['asking_price'], message: 'Enter a price or choose price on request' });
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export type ListingPayload = TablesInsert<'assets'>;

function toForm(a?: Asset | null): FormInput {
  return {
    title: a?.title ?? '',
    summary: a?.summary ?? '',
    description: a?.description ?? '',
    category_id: a?.category_id ?? '',
    jurisdiction_id: a?.jurisdiction_id ?? '',
    transaction_type: a?.transaction_type ?? '',
    operating_status: a?.operating_status ?? '',
    asking_price: a?.asking_price != null ? String(a.asking_price) : '',
    currency: a && (CURRENCIES as readonly string[]).includes(a.currency) ? (a.currency as FormInput['currency']) : 'EUR',
    price_on_request: a?.price_on_request ?? false,
    licence_type: a?.licence_type ?? '',
    regulator: a?.regulator ?? '',
    year_established: a?.year_established != null ? String(a.year_established) : '',
    team_size: a?.team_size ?? '',
    revenue_range: a?.revenue_range ?? '',
    included_assets: a?.included_assets.join('\n') ?? '',
    highlights: a?.highlights.join('\n') ?? '',
    is_featured: a?.is_featured ?? false,
    seo_title: a?.seo_title ?? '',
    seo_description: a?.seo_description ?? '',
  };
}

interface ListingContentFormProps {
  asset?: Asset | null;
  readOnly?: boolean;
  submitLabel: string;
  onSave: (payload: ListingPayload) => Promise<unknown>;
}

export function ListingContentForm({ asset, readOnly, submitLabel, onSave }: ListingContentFormProps) {
  const { data: categories } = useCategories();
  const { data: jurisdictions } = useJurisdictions();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: toForm(asset) });

  useEffect(() => reset(toForm(asset)), [asset, reset]);
  const por = watch('price_on_request');

  const submit = async (v: FormValues) => {
    setServerError(null);
    const n = (s: string) => (s ? s : null);
    try {
      await onSave({
        title: v.title,
        summary: v.summary,
        description: n(v.description),
        category_id: v.category_id,
        jurisdiction_id: v.jurisdiction_id,
        transaction_type: v.transaction_type as TransactionType,
        operating_status: v.operating_status as OperatingStatus,
        asking_price: v.price_on_request ? null : Number(v.asking_price),
        currency: v.currency,
        price_on_request: v.price_on_request,
        licence_type: n(v.licence_type),
        regulator: n(v.regulator),
        year_established: v.year_established ? Number(v.year_established) : null,
        team_size: n(v.team_size),
        revenue_range: n(v.revenue_range),
        included_assets: v.included_assets,
        highlights: v.highlights,
        is_featured: v.is_featured,
        seo_title: n(v.seo_title),
        seo_description: n(v.seo_description),
      });
    } catch (err) {
      setServerError(errorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <h2 className="text-lg font-semibold">Listing content</h2>
      {serverError && <Notice tone="danger">{serverError}</Notice>}
      <fieldset disabled={readOnly} className="space-y-5 disabled:opacity-80">
        <Field label="Title" required error={errors.title?.message}>
          <Input {...register('title')} />
        </Field>
        <Field label="Summary" required error={errors.summary?.message}>
          <Textarea rows={2} {...register('summary')} />
        </Field>
        <Field label="Description" error={errors.description?.message} hint="Blank lines separate paragraphs. Never include identifying details.">
          <Textarea rows={6} {...register('description')} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category" required error={errors.category_id?.message}>
            <Select {...register('category_id')}>
              <option value="">Select…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Jurisdiction" required error={errors.jurisdiction_id?.message}>
            <Select {...register('jurisdiction_id')}>
              <option value="">Select…</option>
              {jurisdictions?.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Transaction type" required error={errors.transaction_type?.message}>
            <Select {...register('transaction_type')}>
              <option value="">Select…</option>
              {TRANSACTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Operating status" required error={errors.operating_status?.message}>
            <Select {...register('operating_status')}>
              <option value="">Select…</option>
              {OPERATING_STATUSES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
          <Field label="Asking price" error={errors.asking_price?.message}>
            <Input inputMode="decimal" disabled={por} {...register('asking_price')} />
          </Field>
          <Field label="Currency">
            <Select {...register('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>
        <CheckboxField label="Price on request">
          <Checkbox {...register('price_on_request')} />
        </CheckboxField>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Licence / authorisation">
            <Input {...register('licence_type')} />
          </Field>
          <Field label="Regulator">
            <Input {...register('regulator')} />
          </Field>
          <Field label="Year established" error={errors.year_established?.message}>
            <Input inputMode="numeric" {...register('year_established')} />
          </Field>
          <Field label="Team size">
            <Input {...register('team_size')} />
          </Field>
          <Field label="Revenue range">
            <Input {...register('revenue_range')} />
          </Field>
        </div>
        <Field label="Included assets" hint="One per line.">
          <Textarea rows={4} {...register('included_assets')} />
        </Field>
        <Field label="Highlights" hint="One per line.">
          <Textarea rows={3} {...register('highlights')} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="SEO title" hint="Optional; defaults to the listing title.">
            <Input {...register('seo_title')} />
          </Field>
          <Field label="SEO description" hint="Optional; defaults to the summary.">
            <Input {...register('seo_description')} />
          </Field>
        </div>
        <CheckboxField label="Feature this listing on the homepage">
          <Checkbox {...register('is_featured')} />
        </CheckboxField>
      </fieldset>
      {!readOnly && (
        <div className="flex justify-end border-t border-slate-100 pt-5">
          <Button type="submit" loading={isSubmitting} disabled={Boolean(asset) && !isDirty}>
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
