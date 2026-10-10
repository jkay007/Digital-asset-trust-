/**
 * Returns a same-origin path for post-login redirects, preventing open
 * redirects to other hosts (e.g. "//evil.example" or "https://…").
 */
export function safeRedirect(target: string | null | undefined, fallback = '/dashboard'): string {
  if (!target) return fallback;
  if (!target.startsWith('/') || target.startsWith('//') || target.startsWith('/\\')) return fallback;
  if (/^\/(login|register|forgot-password|reset-password)/.test(target)) return fallback;
  return target;
}
