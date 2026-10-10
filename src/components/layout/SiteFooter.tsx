import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { footerNav, site } from '@/config/site';
import { DISCLAIMER_POINTS } from './Disclaimer';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark bg-navy-950 text-white/75" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm space-y-5">
            <Logo />
            <p className="text-sm leading-relaxed text-white/65">{site.tagline}. Discreet introductions between qualified buyers and owners of regulated financial businesses.</p>
            <a
              href={`mailto:${site.contactEmail}`}
              className="inline-flex items-center gap-2 text-sm text-gold-300 hover:text-gold-200"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {site.contactEmail}
            </a>
            <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-white/60">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
              Confidential documents are held in private storage and released only to authorised reviewers.
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {footerNav.map((group) => (
              <div key={group.heading}>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                  {group.heading}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link to={link.href} className="text-sm text-white/70 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Important notice</h3>
          <ul className="mt-3 grid gap-2 text-xs leading-relaxed text-white/50 md:grid-cols-2">
            {DISCLAIMER_POINTS.map((p) => (
              <li key={p}>{p}</li>
            ))}
            <li>
              Listings marked DEMO are fictitious examples created to demonstrate the platform. Any resemblance to a real
              business is coincidental. Nothing on this site constitutes investment, legal or regulatory advice.
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.legalEntity}. All rights reserved.
          </p>
          <p>Not a bank, broker or regulated adviser. We do not hold client money.</p>
        </div>
      </div>
    </footer>
  );
}
