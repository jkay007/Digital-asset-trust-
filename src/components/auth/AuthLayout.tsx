import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FileLock2, ShieldCheck, Stamp } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Seo } from '@/components/seo/Seo';
import { site } from '@/config/site';

interface AuthLayoutProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-[calc(100vh-110px)] lg:grid-cols-[1fr_1.05fr]">
      <Seo title={title} noindex />
      <div className="on-dark relative hidden overflow-hidden bg-navy-950 lg:block">
        <img src={site.hero.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-bottom opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/90 via-navy-950/60 to-navy-950/90" aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" aria-label="Home">
            <Logo />
          </Link>
          <div className="max-w-md">
            <p className="eyebrow">Confidential by design</p>
            <p className="mt-4 font-display text-3xl font-semibold leading-snug text-white">
              Discreet access to regulated financial businesses, with honest verification.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-white/75">
              <li className="flex gap-3">
                <Stamp className="h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" /> Listings published only after
                administrator approval
              </li>
              <li className="flex gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" /> Verification recorded by
                authorised reviewers
              </li>
              <li className="flex gap-3">
                <FileLock2 className="h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" /> Documents held in private
                storage
              </li>
            </ul>
          </div>
          <p className="text-xs text-white/40">Listings are not offers. Acquisitions may require regulatory approval.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-semibold">{title}</h1>
          {description && <div className="mt-2 text-sm leading-relaxed text-slate-600">{description}</div>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
