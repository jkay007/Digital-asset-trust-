import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  tone?: 'light' | 'dark';
  showWordmark?: boolean;
}

/** Monogram: a stylised globe meridian inside a champagne-gold square frame. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn('h-9 w-9', className)} aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="38" height="38" rx="3" fill="#0B1F35" stroke="#D9B36C" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="11" fill="none" stroke="#D9B36C" strokeWidth="1.4" />
      <ellipse cx="20" cy="20" rx="5" ry="11" fill="none" stroke="#D9B36C" strokeWidth="1.1" />
      <path d="M9 20h22M11.2 14.5h17.6M11.2 25.5h17.6" stroke="#D9B36C" strokeWidth="0.9" />
    </svg>
  );
}

export function Logo({ className, tone = 'light', showWordmark = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <LogoMark />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display text-[1.15rem] font-semibold tracking-tight',
              tone === 'light' ? 'text-white' : 'text-navy-900',
            )}
          >
            Global Financial Assets
          </span>
          <span
            className={cn(
              'mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em]',
              tone === 'light' ? 'text-gold-400' : 'text-gold-700',
            )}
          >
            Confidential M&amp;A Marketplace
          </span>
        </span>
      )}
    </span>
  );
}
