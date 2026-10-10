import { Suspense, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { PageLoader } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

export interface PanelNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface PanelLayoutProps {
  eyebrow: string;
  title: string;
  nav: PanelNavItem[];
  aside?: ReactNode;
}

/** Shared shell for the user dashboard and admin console. */
export function PanelLayout({ eyebrow, title, nav, aside }: PanelLayoutProps) {
  return (
    <div className="bg-slate-50">
      <div className="container grid gap-8 py-8 lg:grid-cols-[240px_1fr] lg:py-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">{eyebrow}</p>
          <p className="mt-1 font-display text-xl font-semibold">{title}</p>
          <nav aria-label={title} className="mt-5 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-navy-900 text-white' : 'text-slate-700 hover:bg-white hover:text-navy-900',
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
          {aside && <div className="mt-6 hidden lg:block">{aside}</div>}
        </aside>
        <div className="min-w-0">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export function PanelHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description && <div className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-navy-900 tabular">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
