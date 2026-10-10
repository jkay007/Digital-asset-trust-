import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckboxField, Field } from '@/components/ui/field';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { errorMessage } from '@/components/ui/states';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/integrations/supabase/types';
import { BUYER_TYPES, ROLE_LABELS } from '@/lib/constants';
import { passwordSchema, phoneSchema } from '@/lib/schemas';

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your full name').max(120),
  company_name: z.string().trim().max(160),
  job_title: z.string().trim().max(120),
  phone: phoneSchema,
  country: z.string().trim().max(80),
  buyer_type: z.string(),
  investment_focus: z.string().trim().max(1000),
  marketing_opt_in: z.boolean(),
});
type ProfileInput = z.input<typeof profileSchema>;
type ProfileValues = z.output<typeof profileSchema>;

const passwordFormSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type PasswordValues = z.infer<typeof passwordFormSchema>;

function RoleAccess() {
  const { roles, refreshProfile } = useAuth();
  const [busy, setBusy] = useState<AppRole | null>(null);
  const enable = async (role: 'buyer' | 'seller') => {
    setBusy(role);
    const { error } = await supabase.rpc('add_self_service_role', { p_role: role });
    setBusy(null);
    if (error) {
      toast.error(errorMessage(error));
      return;
    }
    toast.success(`${ROLE_LABELS[role]} access enabled`);
    await refreshProfile();
  };
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card" aria-labelledby="access-heading">
      <h2 id="access-heading" className="text-lg font-semibold">
        Account access
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {roles.map((r) => (
          <Badge key={r} tone={r === 'admin' || r === 'reviewer' ? 'gold' : 'navy'}>
            {ROLE_LABELS[r]}
          </Badge>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {!roles.includes('buyer') && (
          <Button variant="outline" onClick={() => enable('buyer')} loading={busy === 'buyer'}>
            Enable buyer access
          </Button>
        )}
        {!roles.includes('seller') && (
          <Button variant="outline" onClick={() => enable('seller')} loading={busy === 'seller'}>
            Enable seller access
          </Button>
        )}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Buyer and seller access are self-service. Reviewer and administrator roles can only be granted by an administrator.
      </p>
    </section>
  );
}

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileInput, unknown, ProfileValues>({ resolver: zodResolver(profileSchema) });

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordFormSchema) });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        company_name: profile.company_name ?? '',
        job_title: profile.job_title ?? '',
        phone: profile.phone ?? '',
        country: profile.country ?? '',
        buyer_type: profile.buyer_type ?? '',
        investment_focus: profile.investment_focus ?? '',
        marketing_opt_in: profile.marketing_opt_in,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (v: ProfileValues) => {
    setServerError(null);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: v.full_name,
        company_name: v.company_name || null,
        job_title: v.job_title || null,
        phone: v.phone ?? null,
        country: v.country || null,
        buyer_type: v.buyer_type || null,
        investment_focus: v.investment_focus || null,
        marketing_opt_in: v.marketing_opt_in,
      })
      .eq('id', user!.id);
    if (error) {
      setServerError(errorMessage(error));
      return;
    }
    toast.success('Profile updated');
    await refreshProfile();
  };

  const onPassword = async ({ password }: PasswordValues) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(errorMessage(error));
      return;
    }
    toast.success('Password changed');
    passwordForm.reset({ password: '', confirm: '' });
  };

  return (
    <div className="space-y-6">
      <PanelHeader title="Profile & access" description={`Email: ${user?.email}`} />
      <RoleAccess />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold">Your details</h2>
        {serverError && <Notice tone="danger">{serverError}</Notice>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" required error={errors.full_name?.message}>
            <Input autoComplete="name" {...register('full_name')} />
          </Field>
          <Field label="Company" error={errors.company_name?.message}>
            <Input autoComplete="organization" {...register('company_name')} />
          </Field>
          <Field label="Job title" error={errors.job_title?.message}>
            <Input {...register('job_title')} />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input type="tel" autoComplete="tel" {...register('phone')} />
          </Field>
          <Field label="Country" error={errors.country?.message}>
            <Input autoComplete="country-name" {...register('country')} />
          </Field>
          <Field label="Buyer type">
            <Select {...register('buyer_type')}>
              <option value="">Not specified</option>
              {BUYER_TYPES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Investment focus" error={errors.investment_focus?.message}>
          <Textarea rows={3} {...register('investment_focus')} />
        </Field>
        <CheckboxField label="Send me occasional market updates by email">
          <Checkbox {...register('marketing_opt_in')} />
        </CheckboxField>
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save profile
          </Button>
        </div>
      </form>

      <form
        onSubmit={passwordForm.handleSubmit(onPassword)}
        noValidate
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-card"
      >
        <h2 className="text-lg font-semibold">Change password</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="New password" error={passwordForm.formState.errors.password?.message}>
            <Input type="password" autoComplete="new-password" {...passwordForm.register('password')} />
          </Field>
          <Field label="Confirm new password" error={passwordForm.formState.errors.confirm?.message}>
            <Input type="password" autoComplete="new-password" {...passwordForm.register('confirm')} />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" variant="outline" loading={passwordForm.formState.isSubmitting}>
            Update password
          </Button>
        </div>
      </form>
    </div>
  );
}
