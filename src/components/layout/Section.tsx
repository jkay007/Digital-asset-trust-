import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: 'white' | 'slate' | 'navy';
  contained?: boolean;
}

export function Section({ tone = 'white', contained = true, className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn(
        'py-16 sm:py-24',
        tone === 'slate' && 'bg-slate-50',
        tone === 'navy' && 'on-dark bg-navy-900 text-white',
        className,
      )}
      {...props}
    >
      {contained ? <div className="container">{children}</div> : children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  action?: ReactNode;
  tone?: 'light' | 'dark';
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  tone = 'dark',
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-10 flex flex-col gap-6 sm:mb-12',
        align === 'center' ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <p className={cn('eyebrow', tone === 'light' && 'eyebrow-on-dark')}>{eyebrow}</p>}
        <h2
          id={id}
          className={cn(
            'mt-3 text-3xl font-semibold leading-tight sm:text-[2.35rem]',
            tone === 'light' ? 'text-white' : 'text-navy-900',
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn('mt-4 text-base leading-relaxed sm:text-lg', tone === 'light' ? 'text-white/70' : 'text-slate-600')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, breadcrumbs, children }: PageHeaderProps) {
  return (
    <div className="on-dark relative overflow-hidden bg-navy-900 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(217,179,108,1) 1px, transparent 1px), linear-gradient(90deg, rgba(217,179,108,1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-gold-400/10 blur-3xl"
      />
      <div className="container relative py-12 sm:py-16">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/55">
              {breadcrumbs.map((crumb, i) => (
                <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-gold-300">
                      {crumb.label}
                    </a>
                  ) : (
                    <span aria-current="page" className="text-white/80">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.1] text-white sm:text-5xl">{title}</h1>
        {description && <div className="mt-5 max-w-3xl text-lg leading-relaxed text-white/70">{description}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
}
