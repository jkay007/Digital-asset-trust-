import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { SelfServiceRoleGate } from '@/components/auth/Guards';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { Button, ButtonLink } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { PageLoader } from '@/components/ui/spinner';
import { errorMessage } from '@/components/ui/states';
import { useMandate } from '@/hooks/useDashboard';
import { useCategories, useJurisdictions } from '@/hooks/useReferenceData';
import { supabase } from '@/integrations/supabase/client';
import type { MandateStatus, TransactionType } from '@/integrations/supabase/types';
import { CURRENCIES, MANDATE_STATUSES, TRANSACTION_TYPES } from '@/lib/constants';

const TIMELINES = ['Immediate (0–3 months)', '3–6 months', '6–12 months', 'Over 12 months', 'Opportunistic'];
const FUNDING = ['Own balance sheet', 'Fund capital', 'Private / family wealth', 'Debt financing', 'Mixed', 'To be arranged'];

const optionalMoney = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) >= 0), 'Enter an amount without symbols')
  .transform((v) => (v ? Number(v) : null));

const schema = z
  .object({
    title: z.string().trim().min(3, 'Give your mandate a short title').max(160),
    category_ids: z.array(z.string()).max(10),
    jurisdiction_ids: z.array(z.string()).max(40),
    transaction_types: z.array(z.string()),
    min_budget: optionalMoney,
    max_budget: optionalMoney,
    currency: z.enum(CURRENCIES),
    timeline: z.string().max(120).optional(),
    funding_source: z.string().max(200).optional(),
    requirements: z.string().trim().max(4000).optional(),
    status: z.enum(['active', 'paused', 'closed']),
  })
  .refine((v) => v.min_budget == null || v.max_budget == null || v.min_budget <= v.max_budget, {
    path: ['max_budget'],
    message: 'Maximum must be greater than or equal to minimum',
  });
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function MandateForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: existing, isLoading } = useMandate(id);
  const { data: categories } = useCategories();
  const { data: jurisdictions } = useJurisdictions();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      category_ids: [],
      jurisdiction_ids: [],
      transaction_types: [],
      min_budget: '',
      max_budget: '',
      currency: 'EUR',
      timeline: '',
      funding_source: '',
      requirements: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        category_ids: existing.category_ids,
        jurisdiction_ids: existing.jurisdiction_ids,
        transaction_types: existing.transaction_types,
        min_budget: existing.min_budget != null ? String(existing.min_budget) : '',
        max_budget: existing.max_budget != null ? String(existing.max_budget) : '',
        currency: (CURRENCIES as readonly string[]).includes(existing.currency) ? (existing.currency as FormInput['currency']) : 'EUR',
        timeline: existing.timeline ?? '',
        funding_source: existing.funding_source ?? '',
        requirements: existing.requirements ?? '',
        status: existing.status,
      });
    }
  }, [existing, reset]);

  const regions = useMemo(() => {
    const map = new Map<string, NonNullable<typeof jurisdictions>>();
    for (const j of jurisdictions ?? []) map.set(j.region, [...(map.get(j.region) ?? []), j]);
    return [...map.entries()];
  }, [jurisdictions]);

  if (isEdit && isLoading) return <PageLoader />;
  if (isEdit && !isLoading && !existing) return <Notice tone="danger">Mandate not found.</Notice>;

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    const payload = {
      title: v.title,
      category_ids: v.category_ids,
      jurisdiction_ids: v.jurisdiction_ids,
      transaction_types: v.transaction_types as TransactionType[],
      min_budget: v.min_budget,
      max_budget: v.max_budget,
      currency: v.currency,
      timeline: v.timeline || null,
      funding_source: v.funding_source || null,
      requirements: v.requirements || null,
      status: v.status as MandateStatus,
    };
    const result = isEdit
      ? await supabase.from('buyer_mandates').update(payload).eq('id', id!).select('id').single()
      : await supabase.from('buyer_mandates').insert(payload).select('id').single();
    if (result.error) {
      setServerError(errorMessage(result.error));
      return;
    }
    toast.success(isEdit ? 'Mandate updated' : 'Mandate registered');
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    navigate(`/dashboard/mandates/${result.data.id}`);
  };

  const box = 'max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4';

  return (
    <div>
      <PanelHeader
        title={isEdit ? 'Edit mandate' : 'New acquisition mandate'}
        description="Mandates are confidential. They are visible only to you and platform administrators."
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
        {serverError && <Notice tone="danger">{serverError}</Notice>}
        <Field label="Mandate title" required error={errors.title?.message} hint="For example: “EU EMI with passporting, up to €3m”.">
          <Input {...register('title')} />
        </Field>

        <Controller
          control={control}
          name="category_ids"
          render={({ field }) => (
            <fieldset>
              <legend className="text-sm font-medium text-navy-800">Categories</legend>
              <p className="mb-2 text-xs text-slate-500">Leave empty for any category.</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories?.map((c) => (
                  <label key={c.id} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <Checkbox checked={field.value.includes(c.id)} onChange={() => field.onChange(toggle(field.value, c.id))} />
                    {c.name}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="jurisdiction_ids"
          render={({ field }) => (
            <fieldset>
              <legend className="text-sm font-medium text-navy-800">Jurisdictions</legend>
              <p className="mb-2 text-xs text-slate-500">Leave empty for any jurisdiction.</p>
              <div className={box}>
                {regions.map(([region, list]) => (
                  <div key={region}>
                    <p className="mb-1.5 mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 first:mt-0">{region}</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {list.map((j) => (
                        <label key={j.id} className="flex items-center gap-2.5 text-sm text-slate-700">
                          <Checkbox checked={field.value.includes(j.id)} onChange={() => field.onChange(toggle(field.value, j.id))} />
                          {j.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="transaction_types"
          render={({ field }) => (
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-navy-800">Transaction types</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {TRANSACTION_TYPES.map((t) => (
                  <label key={t.value} className="flex items-center gap-2.5 text-sm text-slate-700">
                    <Checkbox checked={field.value.includes(t.value)} onChange={() => field.onChange(toggle(field.value, t.value))} />
                    {t.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Minimum budget" error={errors.min_budget?.message}>
            <Input inputMode="decimal" {...register('min_budget')} />
          </Field>
          <Field label="Maximum budget" error={errors.max_budget?.message}>
            <Input inputMode="decimal" {...register('max_budget')} />
          </Field>
          <Field label="Currency" error={errors.currency?.message}>
            <Select {...register('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Timeline">
            <Select {...register('timeline')}>
              <option value="">Select…</option>
              {TIMELINES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Source of funding">
            <Select {...register('funding_source')}>
              <option value="">Select…</option>
              {FUNDING.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Other requirements" error={errors.requirements?.message} hint="Licences, passporting, client base, technology, team, deal structure…">
          <Textarea rows={5} {...register('requirements')} />
        </Field>

        {isEdit && (
          <Field label="Status">
            <Select {...register('status')}>
              {MANDATE_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
          <ButtonLink to="/dashboard/mandates" variant="outline">
            Cancel
          </ButtonLink>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Register mandate'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function MandateFormPage() {
  return (
    <SelfServiceRoleGate role="buyer">
      <MandateForm />
    </SelfServiceRoleGate>
  );
}
