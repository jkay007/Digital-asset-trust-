import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MailCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { CheckboxField, Field } from '@/components/ui/field';
import { Checkbox, Input, Select } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { supabase } from '@/integrations/supabase/client';
import { BUYER_TYPES } from '@/lib/constants';
import { passwordSchema } from '@/lib/schemas';

const BUYER_TYPE_VALUES = BUYER_TYPES.map((b) => b.value) as [string, ...string[]];

const schema = z
  .object({
    full_name: z.string().trim().min(2, 'Please enter your full name').max(120),
    email: z.string().trim().email('Enter a valid email address'),
    company_name: z.string().trim().max(160).optional(),
    job_title: z.string().trim().max(120).optional(),
    country: z.string().trim().max(80).optional(),
    buyer_type: z.enum(BUYER_TYPE_VALUES).optional().or(z.literal('')),
    password: passwordSchema,
    confirm: z.string(),
    accept: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue' }) }),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type Input = z.input<typeof schema>;
type Values = z.output<typeof schema>;

export default function RegisterPage({ accountType }: { accountType: 'buyer' | 'seller' }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const isBuyer = accountType === 'buyer';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, Values>({ resolver: zodResolver(schema), defaultValues: { buyer_type: '' } });

  const onSubmit = async (values: Values) => {
    setError(null);
    const next = isBuyer ? '/dashboard' : '/dashboard/submissions/new';
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}${next}`,
        // The database only ever honours 'buyer' or 'seller' here; privileged
        // roles cannot be requested at sign-up.
        data: {
          account_type: accountType,
          full_name: values.full_name,
          company_name: values.company_name || null,
          job_title: values.job_title || null,
          country: values.country || null,
          buyer_type: isBuyer ? values.buyer_type || null : null,
          accepted_terms: 'true',
        },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate(next, { replace: true });
    } else {
      setConfirmEmail(values.email);
    }
  };

  if (confirmEmail) {
    return (
      <AuthLayout title="Check your email">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900" role="status">
          <MailCheck className="mb-3 h-7 w-7 text-emerald-700" aria-hidden="true" />
          We have sent a confirmation link to <strong>{confirmEmail}</strong>. Follow the link to activate your account,
          then sign in.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={isBuyer ? 'Register as a buyer' : 'Register as a seller'}
      description={
        isBuyer
          ? 'Save listings, send confidential enquiries and register acquisition mandates.'
          : 'Submit businesses and licences for confidential review. Nothing is published until approved.'
      }
      footer={
        <p>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-navy-800 underline underline-offset-2">
            Sign in
          </Link>
          . {isBuyer ? 'Selling a business?' : 'Looking to buy?'}{' '}
          <Link
            to={isBuyer ? '/register/seller' : '/register/buyer'}
            className="font-semibold text-navy-800 underline underline-offset-2"
          >
            Register as a {isBuyer ? 'seller' : 'buyer'}
          </Link>
          .
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Full name" required error={errors.full_name?.message}>
          <Input autoComplete="name" {...register('full_name')} />
        </Field>
        <Field label="Work email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company" error={errors.company_name?.message}>
            <Input autoComplete="organization" {...register('company_name')} />
          </Field>
          <Field label="Job title" error={errors.job_title?.message}>
            <Input autoComplete="organization-title" {...register('job_title')} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Country" error={errors.country?.message}>
            <Input autoComplete="country-name" {...register('country')} />
          </Field>
          {isBuyer && (
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
          )}
        </div>
        <Field label="Password" required error={errors.password?.message} hint="At least 10 characters, including a letter and a number.">
          <Input type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        <Field label="Confirm password" required error={errors.confirm?.message}>
          <Input type="password" autoComplete="new-password" {...register('confirm')} />
        </Field>
        <CheckboxField
          error={errors.accept?.message}
          label={
            <>
              I accept the{' '}
              <Link to="/legal/terms" className="font-medium text-navy-800 underline underline-offset-2">
                terms of use
              </Link>{' '}
              and{' '}
              <Link to="/legal/privacy" className="font-medium text-navy-800 underline underline-offset-2">
                privacy notice
              </Link>
              , and understand that listings are not offers.
            </>
          }
        >
          <Checkbox {...register('accept')} />
        </CheckboxField>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Create {accountType} account
        </Button>
      </form>
    </AuthLayout>
  );
}
