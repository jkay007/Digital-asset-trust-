import { isSupabaseConfigured } from '@/integrations/supabase/client';

/** Shown in development builds when the Supabase environment is missing. */
export function ConfigWarning() {
  if (isSupabaseConfigured) return null;
  return (
    <div role="alert" className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-950">
      Backend not configured: set <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
      <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> (see README). Marketplace data and sign-in are
      unavailable.
    </div>
  );
}
