import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { supabase } from '@/integrations/supabase/client';

const schema = z.object({ email: z.string().trim().email('Enter a valid email address') });
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: Values) => {
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    // Always show the same confirmation so the form cannot be used to discover accounts.
    if (resetError && resetError.status && resetError.status >= 500) {
      setError('The reset service is unavailable. Please try again later.');
      return;
    }
    setSent(true);
  };

  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your account email and we will send you a link to choose a new password."
      footer={
        <Link to="/login" className="font-semibold text-navy-800 underline underline-offset-2">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <Notice tone="success" title="Check your email" role="status">
          If an account exists for that address, a password reset link is on its way.
        </Notice>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {error && <Notice tone="danger">{error}</Notice>}
          <Field label="Email" required error={errors.email?.message}>
            <Input type="email" autoComplete="email" {...register('email')} />
          </Field>
          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
