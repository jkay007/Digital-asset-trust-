import { useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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

/**
 * For self-service roles (buyer/seller): instead of a dead end, offer to enable
 * the role. The database function only ever grants 'buyer' or 'seller'.
 */
export function SelfServiceRoleGate({ role, children }: { role: 'buyer' | 'seller'; children: ReactNode }) {
  const { hasRole, loading, refreshProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (loading) return <PageLoader label="Checking permissions" />;
  if (hasRole(role)) return <>{children}</>;
  const enable = async () => {
    setBusy(true);
    setError(null);
    const { error: rpcError } = await supabase.rpc('add_self_service_role', { p_role: role });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    await refreshProfile();
  };
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
      <ShieldAlert className="mx-auto h-9 w-9 text-gold-600" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold">Enable {role} access</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        {role === 'seller'
          ? 'Seller access lets you prepare confidential submissions and upload documents to private storage. Nothing is published without administrator approval.'
          : 'Buyer access lets you register acquisition mandates so our team can identify suitable opportunities.'}
      </p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <Button className="mt-6" onClick={enable} loading={busy}>
        Enable {role} access
      </Button>
    </div>
  );
}
