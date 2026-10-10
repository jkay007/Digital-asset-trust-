import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Send, Trash2, Undo2 } from 'lucide-react';
import { SelfServiceRoleGate } from '@/components/auth/Guards';
import { DocumentsPanel } from '@/components/dashboard/DocumentsPanel';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { SubmissionSummary } from '@/components/dashboard/SubmissionSummary';
import { SubmissionStatusBadge } from '@/components/status/StatusBadges';
import { Button, ButtonLink } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CheckboxField, Field } from '@/components/ui/field';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { PageLoader } from '@/components/ui/spinner';
import { errorMessage } from '@/components/ui/states';
import { useMyListings, useSubmission } from '@/hooks/useDashboard';
import { useCategories, useJurisdictions } from '@/hooks/useReferenceData';
import { supabase } from '@/integrations/supabase/client';
import type { OperatingStatus, SellerSubmission, TransactionType } from '@/integrations/supabase/types';
import { CURRENCIES, OPERATING_STATUSES, TRANSACTION_TYPES } from '@/lib/constants';
import { AssetStatusBadge } from '@/components/status/StatusBadges';
import NotFoundPage from '../NotFoundPage';

const TEAM_SIZES = ['1–10', '11–25', '26–50', '51–100', '100+'];
const REVENUE_RANGES = ['Pre-revenue', 'Under €1m', '€1m–€5m', '€5m–€20m', '€20m+', 'Run-off', 'Confidential'];
const EDITABLE = new Set(['draft', 'changes_requested']);

const text = (max: number) => z.string().trim().max(max, `Must be ${max} characters or fewer`);
const lines = (maxItems: number) =>
  z
    .string()
    .optional()
    .transform((v) =>
      (v ?? '')
        .split('\n')
        .map((s) => s.trim().slice(0, 200))
        .filter(Boolean)
        .slice(0, maxItems),
    );

const schema = z.object({
  title: z.string().trim().min(3, 'Enter a working title (at least 3 characters)').max(160),
  category_id: z.string(),
  jurisdiction_id: z.string(),
  transaction_type: z.string(),
  operating_status: z.string(),
  summary: text(400),
  description: text(10000),
  asking_price: z
    .string()
    .trim()
    .refine((v) => !v || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) > 0), 'Enter an amount without symbols or commas'),
  currency: z.enum(CURRENCIES),
  price_on_request: z.boolean(),
  licence_type: text(200),
  regulator: text(200),
  licence_number: text(100),
  year_established: z
    .string()
    .trim()
    .refine((v) => !v || (/^\d{4}$/.test(v) && Number(v) >= 1800 && Number(v) <= 2100), 'Enter a four-digit year'),
  team_size: z.string(),
  revenue_range: z.string(),
  included_assets: lines(30),
  highlights: lines(12),
  company_legal_name: text(200),
  registration_number: text(100),
  reason_for_sale: text(2000),
  contact_name: text(120),
  contact_email: z.string().trim().refine((v) => !v || z.string().email().safeParse(v).success, 'Enter a valid email address'),
  contact_phone: z.string().trim().refine((v) => !v || /^[+()\d\s.-]{6,30}$/.test(v), 'Enter a valid phone number'),
  seller_declaration: z.boolean(),
});
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

const EMPTY: FormInput = {
  title: '',
  category_id: '',
  jurisdiction_id: '',
  transaction_type: '',
  operating_status: '',
  summary: '',
  description: '',
  asking_price: '',
  currency: 'EUR',
  price_on_request: false,
  licence_type: '',
  regulator: '',
  licence_number: '',
  year_established: '',
  team_size: '',
  revenue_range: '',
  included_assets: '',
  highlights: '',
  company_legal_name: '',
  registration_number: '',
  reason_for_sale: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  seller_declaration: false,
};

function toForm(s: SellerSubmission): FormInput {
  return {
    title: s.title,
    category_id: s.category_id ?? '',
    jurisdiction_id: s.jurisdiction_id ?? '',
    transaction_type: s.transaction_type ?? '',
    operating_status: s.operating_status ?? '',
    summary: s.summary ?? '',
    description: s.description ?? '',
    asking_price: s.asking_price != null ? String(s.asking_price) : '',
    currency: (CURRENCIES as readonly string[]).includes(s.currency) ? (s.currency as FormInput['currency']) : 'EUR',
    price_on_request: s.price_on_request,
    licence_type: s.licence_type ?? '',
    regulator: s.regulator ?? '',
    licence_number: s.licence_number ?? '',
    year_established: s.year_established != null ? String(s.year_established) : '',
    team_size: s.team_size ?? '',
    revenue_range: s.revenue_range ?? '',
    included_assets: s.included_assets.join('\n'),
    highlights: s.highlights.join('\n'),
    company_legal_name: s.company_legal_name ?? '',
    registration_number: s.registration_number ?? '',
    reason_for_sale: s.reason_for_sale ?? '',
    contact_name: s.contact_name ?? '',
    contact_email: s.contact_email ?? '',
    contact_phone: s.contact_phone ?? '',
    seller_declaration: s.seller_declaration,
  };
}

function toPayload(v: FormValues) {
  const n = (s: string) => (s ? s : null);
  return {
    title: v.title,
    category_id: n(v.category_id),
    jurisdiction_id: n(v.jurisdiction_id),
    transaction_type: n(v.transaction_type) as TransactionType | null,
    operating_status: n(v.operating_status) as OperatingStatus | null,
    summary: n(v.summary),
    description: n(v.description),
    asking_price: v.price_on_request || !v.asking_price ? null : Number(v.asking_price),
    currency: v.currency,
    price_on_request: v.price_on_request,
    licence_type: n(v.licence_type),
    regulator: n(v.regulator),
    licence_number: n(v.licence_number),
    year_established: v.year_established ? Number(v.year_established) : null,
    team_size: n(v.team_size),
    revenue_range: n(v.revenue_range),
    included_assets: v.included_assets,
    highlights: v.highlights,
    company_legal_name: n(v.company_legal_name),
    registration_number: n(v.registration_number),
    reason_for_sale: n(v.reason_for_sale),
    contact_name: n(v.contact_name),
    contact_email: n(v.contact_email),
    contact_phone: n(v.contact_phone),
    seller_declaration: v.seller_declaration,
  };
}

/** Client-side mirror of private.assert_submission_complete (the server re-checks). */
function completenessErrors(v: FormValues): [keyof FormInput, string][] {
  const out: [keyof FormInput, string][] = [];
  if (v.title.length < 5) out.push(['title', 'Use at least 5 characters']);
  if (!v.category_id) out.push(['category_id', 'Select a category']);
  if (!v.jurisdiction_id) out.push(['jurisdiction_id', 'Select a jurisdiction']);
  if (!v.transaction_type) out.push(['transaction_type', 'Select a transaction type']);
  if (!v.operating_status) out.push(['operating_status', 'Select an operating status']);
  if (v.summary.length < 20) out.push(['summary', 'Write a summary of at least 20 characters']);
  if (!v.price_on_request && !v.asking_price) out.push(['asking_price', 'Enter an asking price or choose price on request']);
  if (!v.company_legal_name) out.push(['company_legal_name', 'Required for review (never published)']);
  if (!v.contact_email) out.push(['contact_email', 'Required for review (never published)']);
  if (!v.seller_declaration) out.push(['seller_declaration', 'Please confirm the declaration']);
  return out;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-lg font-semibold" aria-hidden="true">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </fieldset>
  );
}

function SubmissionEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: submission, isLoading, error } = useSubmission(id);
  const { data: listings } = useMyListings();
  const { data: categories } = useCategories();
  const { data: jurisdictions } = useJurisdictions();
  const [serverError, setServerError] = useState<string | null>(null);
  const [intent, setIntent] = useState<'draft' | 'submit'>('draft');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (submission) reset(toForm(submission));
  }, [submission, reset]);

  const por = watch('price_on_request');

  if (!isNew && isLoading) return <PageLoader />;
  if (!isNew && error) return <Notice tone="danger">{errorMessage(error)}</Notice>;
  if (!isNew && !submission) return <NotFoundPage title="Submission not found" />;

  const editable = isNew || EDITABLE.has(submission!.status);
  const listing = submission ? listings?.find((l) => l.submission_id === submission.id) : undefined;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['me'] }).then(() => queryClient.invalidateQueries({ queryKey: ['submission', id] }));

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    if (intent === 'submit') {
      const missing = completenessErrors(values);
      if (missing.length) {
        missing.forEach(([field, message]) => setError(field, { message }));
        setServerError('Please complete the highlighted fields before submitting for review.');
        return;
      }
    }
    const payload = toPayload(values);
    const status: 'draft' | 'submitted' | undefined =
      intent === 'submit' ? 'submitted' : isNew ? 'draft' : undefined;
    const body = status ? { ...payload, status } : payload;
    const result = isNew
      ? await supabase.from('seller_submissions').insert(body).select('id').single()
      : await supabase.from('seller_submissions').update(body).eq('id', id!).select('id').single();
    if (result.error) {
      setServerError(errorMessage(result.error));
      return;
    }
    await refresh();
    if (intent === 'submit') {
      toast.success('Submitted for review. We will be in touch.');
      navigate('/dashboard/submissions');
    } else {
      toast.success(isNew ? 'Draft saved. You can now upload documents.' : 'Changes saved');
      if (isNew) navigate(`/dashboard/submissions/${result.data.id}`, { replace: true });
    }
  };

  const withdraw = async () => {
    const { error: rpcError } = await supabase.rpc('withdraw_submission', { p_submission_id: id! });
    if (rpcError) {
      toast.error(errorMessage(rpcError));
      throw rpcError;
    }
    toast.success('Submission withdrawn');
    await refresh();
  };

  const deleteDraft = async () => {
    const { error: delError } = await supabase.from('seller_submissions').delete().eq('id', id!);
    if (delError) {
      toast.error(errorMessage(delError));
      throw delError;
    }
    toast.success('Draft deleted');
    await queryClient.invalidateQueries({ queryKey: ['me'] });
    navigate('/dashboard/submissions');
  };

  const canWithdraw = submission && ['draft', 'submitted', 'under_review', 'changes_requested'].includes(submission.status);

  return (
    <div>
      <PanelHeader
        title={isNew ? 'New confidential submission' : submission!.title}
        description={
          isNew ? (
            'Save a draft at any time. Nothing is visible to buyers until an administrator approves and publishes a listing.'
          ) : (
            <span className="flex flex-wrap items-center gap-2">
              <SubmissionStatusBadge status={submission!.status} />
              {listing && (
                <span className="flex items-center gap-2 text-xs text-slate-500">
                  Listing {listing.reference_code}: <AssetStatusBadge status={listing.status} />
                </span>
              )}
            </span>
          )
        }
        actions={
          <>
            {canWithdraw && (
              <ConfirmDialog
                title="Withdraw this submission?"
                description="It will no longer be reviewed. You can start a new submission later."
                confirmLabel="Withdraw"
                confirmVariant="danger"
                onConfirm={withdraw}
                trigger={(open) => (
                  <Button variant="outline" size="sm" onClick={open}>
                    <Undo2 className="h-4 w-4" aria-hidden="true" /> Withdraw
                  </Button>
                )}
              />
            )}
            {submission?.status === 'draft' && (
              <ConfirmDialog
                title="Delete this draft?"
                description="The draft and its documents will be permanently deleted."
                confirmLabel="Delete draft"
                confirmVariant="danger"
                onConfirm={deleteDraft}
                trigger={(open) => (
                  <Button variant="danger-outline" size="sm" onClick={open}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                  </Button>
                )}
              />
            )}
          </>
        }
      />

      {submission?.feedback_to_seller && ['changes_requested', 'rejected'].includes(submission.status) && (
        <Notice tone={submission.status === 'rejected' ? 'danger' : 'warning'} title={submission.status === 'rejected' ? 'Submission rejected' : 'Changes requested by our reviewers'} className="mb-6">
          <p className="whitespace-pre-line">{submission.feedback_to_seller}</p>
        </Notice>
      )}
      {submission && ['submitted', 'under_review'].includes(submission.status) && (
        <Notice tone="info" className="mb-6" title="Awaiting review">
          Your submission is locked while it is reviewed. You will be able to edit it again if changes are requested.
        </Notice>
      )}
      {submission?.status === 'approved' && (
        <Notice tone="success" className="mb-6" title="Approved">
          An anonymised listing has been created. It becomes visible to buyers only when an administrator publishes it.
        </Notice>
      )}

      {editable ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {serverError && <Notice tone="danger" role="alert">{serverError}</Notice>}

          <Section title="1. The business" description="This information forms the anonymised public listing once approved.">
            <Field label="Listing title" required error={errors.title?.message} hint="Describe the business without naming it, e.g. “Authorised EMI with EU passporting”.">
              <Input {...register('title')} />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
            </div>
            <Field label="Summary" required error={errors.summary?.message} hint="One or two sentences shown on listing cards (20–400 characters).">
              <Textarea rows={3} {...register('summary')} />
            </Field>
            <Field label="Description" error={errors.description?.message} hint="Separate paragraphs with a blank line. Do not include identifying details.">
              <Textarea rows={7} {...register('description')} />
            </Field>
          </Section>

          <Section title="2. Deal structure">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_140px]">
              <Field label="Asking price" required={!por} error={errors.asking_price?.message}>
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
            <CheckboxField label="Price on request (the asking price will not be shown)">
              <Checkbox {...register('price_on_request')} />
            </CheckboxField>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Year established" error={errors.year_established?.message}>
                <Input inputMode="numeric" maxLength={4} {...register('year_established')} />
              </Field>
              <Field label="Team size">
                <Select {...register('team_size')}>
                  <option value="">Select…</option>
                  {TEAM_SIZES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Revenue range">
                <Select {...register('revenue_range')}>
                  <option value="">Select…</option>
                  {REVENUE_RANGES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="3. Licence and regulator">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Licence / authorisation type" error={errors.licence_type?.message}>
                <Input {...register('licence_type')} />
              </Field>
              <Field label="Regulator" error={errors.regulator?.message}>
                <Input {...register('regulator')} />
              </Field>
            </div>
            <Field label="Licence or registration number" error={errors.licence_number?.message} hint="Confidential. Used by reviewers to check the regulator’s register; never published.">
              <Input {...register('licence_number')} />
            </Field>
            <Notice tone="warning">
              Licences are often not transferable and a change of control usually requires regulatory approval. Describe
              what the buyer will actually acquire (for example the shares of the licensed company).
            </Notice>
          </Section>

          <Section title="4. What is included">
            <Field label="Included assets" hint="One item per line (up to 30), e.g. licence held by the target, safeguarding account, platform IP.">
              <Textarea rows={5} {...register('included_assets')} />
            </Field>
            <Field label="Highlights" hint="One per line (up to 12).">
              <Textarea rows={4} {...register('highlights')} />
            </Field>
          </Section>

          <Section title="5. Confidential details" description="Never shown on the listing. Used only by our reviewers.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Company legal name" required error={errors.company_legal_name?.message}>
                <Input {...register('company_legal_name')} />
              </Field>
              <Field label="Company registration number" error={errors.registration_number?.message}>
                <Input {...register('registration_number')} />
              </Field>
            </div>
            <Field label="Reason for sale" error={errors.reason_for_sale?.message}>
              <Textarea rows={3} {...register('reason_for_sale')} />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Contact name" error={errors.contact_name?.message}>
                <Input autoComplete="name" {...register('contact_name')} />
              </Field>
              <Field label="Contact email" required error={errors.contact_email?.message}>
                <Input type="email" autoComplete="email" {...register('contact_email')} />
              </Field>
              <Field label="Contact phone" error={errors.contact_phone?.message}>
                <Input type="tel" autoComplete="tel" {...register('contact_phone')} />
              </Field>
            </div>
          </Section>

          {!isNew && <DocumentsPanel submissionId={id!} editable />}
          {isNew && (
            <Notice tone="info">Save your draft to upload supporting documents to private storage.</Notice>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <CheckboxField
              error={errors.seller_declaration?.message}
              label="I confirm that I am authorised to market this business, that the information provided is accurate and not misleading, and that I will notify Global Financial Assets of any material change."
            >
              <Checkbox {...register('seller_declaration')} />
            </CheckboxField>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <ButtonLink to="/dashboard/submissions" variant="ghost">
                Cancel
              </ButtonLink>
              <Button type="submit" variant="outline" loading={isSubmitting && intent === 'draft'} onClick={() => setIntent('draft')}>
                {isNew ? 'Save draft' : 'Save changes'}
              </Button>
              <Button type="submit" loading={isSubmitting && intent === 'submit'} onClick={() => setIntent('submit')}>
                <Send className="h-4 w-4" aria-hidden="true" />
                {submission?.status === 'changes_requested' ? 'Resubmit for review' : 'Submit for review'}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <SubmissionSummary submission={submission!} />
          <DocumentsPanel submissionId={id!} editable={false} />
          {listing?.status === 'published' && (
            <p className="text-sm">
              <Link to={`/listings/${listing.slug}`} className="font-semibold text-navy-800 underline underline-offset-2">
                View the published listing
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SubmissionFormPage() {
  return (
    <SelfServiceRoleGate role="seller">
      <SubmissionEditor />
    </SelfServiceRoleGate>
  );
}
