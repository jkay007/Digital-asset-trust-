import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import type { AppRole } from '@/integrations/supabase/types';

/**
 * Client-side route guards improve navigation only. Every permission is enforced
 * again by row-level security and database functions on the server.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader label="Checking your session" />;
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
}

export function RequireRole({ roles, children }: { roles: AppRole[]; children: ReactNode }) {
  const { roles: mine, loading } = useAuth();
  if (loading) return <PageLoader label="Checking permissions" />;
  if (!roles.some((r) => mine.includes(r))) return <AccessDenied />;
  return <>{children}</>;
}

export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
      <ShieldAlert className="h-10 w-10 text-gold-600" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold">You do not have access to this area</h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        {message ?? 'Your account does not have the role required for this page. If you believe this is an error, contact an administrator.'}
      </p>
      <ButtonLink to="/dashboard" variant="outline" className="mt-6">
        Back to dashboard
      </ButtonLink>
    </div>
  );
}
