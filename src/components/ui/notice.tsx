import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'info' | 'warning' | 'success' | 'danger' | 'demo';

const styles: Record<Tone, string> = {
  info: 'border-navy-200 bg-navy-50 text-navy-800',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  danger: 'border-red-200 bg-red-50 text-red-900',
  demo: 'border-dashed border-violet-300 bg-violet-50 text-violet-900',
};

const icons: Record<Tone, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  danger: ShieldAlert,
  demo: Info,
};

interface NoticeProps {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: 'status' | 'alert' | 'note';
}

export function Notice({ tone = 'info', title, children, className, role }: NoticeProps) {
  const Icon = icons[tone];
  return (
    <div
      role={role ?? (tone === 'danger' ? 'alert' : 'note')}
      className={cn('flex gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed', styles[tone], className)}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
