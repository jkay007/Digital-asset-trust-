import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { PageLoader } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { passwordSchema } from '@/lib/schemas';

const schema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });
type Values = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  if (loading) return <PageLoader label="Verifying reset link" />;

  if (!session) {
    return (
      <AuthLayout title="Reset link expired">
        <Notice tone="warning">
          This password reset link is invalid or has expired. Request a new link to continue.
        </Notice>
        <Link to="/forgot-password" className="mt-6 inline-block font-semibold text-navy-800 underline underline-offset-2">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  const onSubmit = async ({ password }: Values) => {
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    toast.success('Your password has been updated');
    navigate('/dashboard', { replace: true });
  };

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="New password" required error={errors.password?.message} hint="At least 10 characters, including a letter and a number.">
          <Input type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        <Field label="Confirm new password" required error={errors.confirm?.message}>
          <Input type="password" autoComplete="new-password" {...register('confirm')} />
        </Field>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </AuthLayout>
  );
}
