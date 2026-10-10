import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckboxField, Field } from '@/components/ui/field';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { errorMessage } from '@/components/ui/states';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BUYER_TYPES } from '@/lib/constants';
import { enquirySchema, type EnquiryInput, type EnquiryValues } from '@/lib/schemas';

interface EnquiryFormProps {
  assetId: string;
  assetTitle: string;
  isDemo: boolean;
  isSold: boolean;
}

export function EnquiryForm({ assetId, assetTitle, isDemo, isSold }: EnquiryFormProps) {
  const { user, profile } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput, unknown, EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: '', email: '', company: '', phone: '', buyer_type: '', message: '', nda_requested: true, website: '' },
  });

  useEffect(() => {
    if (user) {
      reset((prev) => ({
        ...prev,
        name: prev.name || profile?.full_name || '',
        email: prev.email || user.email || '',
        company: prev.company || profile?.company_name || '',
        phone: prev.phone || profile?.phone || '',
        buyer_type: prev.buyer_type || profile?.buyer_type || '',
      }));
    }
  }, [user, profile, reset]);

  if (isSold) {
    return (
      <Notice tone="info" title="This opportunity has been sold">
        Enquiries are closed. Register an acquisition mandate and we will contact you about comparable opportunities.
      </Notice>
    );
  }

  if (isDemo) {
    return (
      <Notice tone="demo" title="Enquiries are disabled for demo listings">
        This is an illustrative demo listing. It is not a real business and is not available for acquisition.
      </Notice>
    );
  }

  if (submitted) {
    return (
      <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        <CheckCircle2 className="mb-2 h-6 w-6 text-emerald-700" aria-hidden="true" />
        <p className="font-semibold">Enquiry received</p>
        <p className="mt-1 leading-relaxed">
          Thank you. Our team will review your enquiry and respond confidentially. Your details are not shared with the
          seller without your consent.
        </p>
        {user && (
          <Link to="/dashboard/enquiries" className="mt-3 inline-block font-medium underline underline-offset-2">
            View your enquiries
          </Link>
        )}
      </div>
    );
  }

  const onSubmit = async (values: EnquiryValues) => {
    setServerError(null);
    if (values.website) {
      // Honeypot triggered: behave as if successful without sending anything.
      setSubmitted(true);
      return;
    }
    const { error } = await supabase.rpc('submit_enquiry', {
      p_asset_id: assetId,
      p_name: values.name,
      p_email: values.email,
      p_company: values.company ?? null,
      p_phone: values.phone ?? null,
      p_buyer_type: values.buyer_type ?? null,
      p_message: values.message,
      p_nda_requested: values.nda_requested,
      p_consent: values.consent,
    });
    if (error) {
      setServerError(errorMessage(error));
      return;
    }
    setSubmitted(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4" aria-label={`Confidential enquiry about ${assetTitle}`}>
      {serverError && (
        <Notice tone="danger" title="We could not send your enquiry">
          {serverError}
        </Notice>
      )}
      <Field label="Full name" required error={errors.name?.message}>
        <Input autoComplete="name" {...register('name')} />
      </Field>
      <Field label="Email" required error={errors.email?.message}>
        <Input type="email" autoComplete="email" {...register('email')} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field label="Company" error={errors.company?.message}>
          <Input autoComplete="organization" {...register('company')} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...register('phone')} />
        </Field>
      </div>
      <Field label="Buyer type" error={errors.buyer_type?.message}>
        <Select {...register('buyer_type')}>
          <option value="">Select…</option>
          {BUYER_TYPES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label="Message"
        required
        error={errors.message?.message}
        hint="Outline your interest, intended structure and expected timeline. Please do not include passwords or account numbers."
      >
        <Textarea rows={5} {...register('message')} />
      </Field>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="enquiry-website">Website</label>
        <input id="enquiry-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>
      <CheckboxField label="I would like to receive a non-disclosure agreement">
        <Checkbox {...register('nda_requested')} />
      </CheckboxField>
      <CheckboxField
        error={errors.consent?.message}
        label={
          <>
            I agree to the{' '}
            <Link to="/legal/privacy" className="font-medium text-navy-800 underline underline-offset-2">
              privacy notice
            </Link>{' '}
            and understand this listing is not an offer and any acquisition may require regulatory approval.
          </>
        }
      >
        <Checkbox {...register('consent')} />
      </CheckboxField>
      <Button type="submit" className="w-full" loading={isSubmitting}>
        <Lock className="h-4 w-4" aria-hidden="true" />
        Send confidential enquiry
      </Button>
    </form>
  );
}
