import { Building2, CircleDashed, FileCheck2, Landmark } from 'lucide-react';
import type { VerificationLevel } from '@/integrations/supabase/types';
import { VERIFICATION_LEVELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const STYLE: Record<VerificationLevel, { icon: typeof Building2; className: string }> = {
  unverified: { icon: CircleDashed, className: 'border-slate-300 bg-white text-slate-600' },
  company_checked: { icon: Building2, className: 'border-navy-200 bg-navy-50 text-navy-800' },
  regulator_record_checked: { icon: Landmark, className: 'border-gold-300 bg-gold-50 text-gold-800' },
  documents_reviewed: { icon: FileCheck2, className: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
};

interface VerificationBadgeProps {
  level: VerificationLevel;
  isDemo?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Displays the verification state exactly as recorded by an authorised reviewer.
 * The value comes from the database (derived from verification_records) and is
 * never computed or upgraded in the browser. Demo states are explicitly labelled.
 */
export function VerificationBadge({ level, isDemo, size = 'sm', className }: VerificationBadgeProps) {
  const meta = VERIFICATION_LEVELS.find((v) => v.value === level) ?? VERIFICATION_LEVELS[0]!;
  const { icon: Icon, className: tone } = STYLE[level] ?? STYLE.unverified;
  const tooltip = isDemo
    ? `Illustrative demo state only. No verification has been performed for this demo listing.`
    : meta.description;
  return (
    <span
      title={tooltip}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        tone,
        isDemo && 'border-dashed',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
      {isDemo && <span className="font-semibold uppercase tracking-wide text-violet-700">Demo ·</span>}
      {meta.label}
    </span>
  );
}
