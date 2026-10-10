import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { supabase } from '@/integrations/supabase/client';
import { safeRedirect } from '@/lib/redirect';
import { useQueryClient } from '@tanstack/react-query';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const redirect = safeRedirect(params.get('redirect'));
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword(values);
    if (signInError) {
      // Do not reveal whether the email exists.
      setError(
        signInError.message.toLowerCase().includes('confirm')
          ? 'Please confirm your email address before signing in.'
          : 'Incorrect email or password.',
      );
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ['auth'] });
    navigate(redirect, { replace: true });
  };

  return (
    <AuthLayout
      title="Sign in"
      description="Access your saved listings, enquiries, mandates and submissions."
      footer={
        <p>
          New to Global Financial Assets?{' '}
          <Link to="/register/buyer" className="font-semibold text-navy-800 underline underline-offset-2">
            Register as a buyer
          </Link>{' '}
          or{' '}
          <Link to="/register/seller" className="font-semibold text-navy-800 underline underline-offset-2">
            as a seller
          </Link>
          .
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {error && <Notice tone="danger">{error}</Notice>}
        <Field label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field label="Password" required error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...register('password')} />
        </Field>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-navy-700 underline-offset-2 hover:underline">
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
