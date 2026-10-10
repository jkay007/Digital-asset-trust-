import { Link } from 'react-router-dom';
import { FileLock2, ShieldCheck, Stamp } from 'lucide-react';
import { site } from '@/config/site';
import { HeroSearch } from './HeroSearch';

const POPULAR = [
  { label: 'EMIs & payments', href: '/categories/payments-emis' },
  { label: 'Crypto & CASPs', href: '/categories/crypto-digital-assets' },
  { label: 'Banks', href: '/categories/banks-financial-institutions' },
  { label: 'Brokerages', href: '/categories/forex-brokerage' },
  { label: 'Insurance', href: '/categories/insurance' },
];

const TRUST = [
  { icon: Stamp, label: 'Every listing approved before publication' },
  { icon: ShieldCheck, label: 'Verification recorded by authorised reviewers' },
  { icon: FileLock2, label: 'Confidential documents in private storage' },
];

export function Hero() {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-navy-950 text-white" aria-labelledby="hero-heading">
      <img
        src={site.hero.imageUrl}
        alt=""
        role="presentation"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-bottom"
        fetchPriority="high"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950 via-navy-950/75 to-transparent"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-navy-950/90 to-transparent" />

      <div className="container pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28">
        <div className="max-w-3xl animate-fade-up">
          <p className="eyebrow">Confidential M&amp;A for regulated finance</p>
          <h1
            id="hero-heading"
            className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.05] text-white sm:text-6xl lg:text-[4.1rem]"
          >
            Acquire regulated financial businesses <span className="text-gold-300">with clarity.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
            A moderated marketplace for banks, EMIs, crypto-asset service providers, brokerages, investment firms,
            insurers and financial licences across major and offshore jurisdictions.
          </p>
        </div>

        <HeroSearch className="mt-10 max-w-5xl" />

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-white/55">Popular:</span>
          {POPULAR.map((p) => (
            <Link
              key={p.href}
              to={p.href}
              className="rounded-full border border-white/15 px-3 py-1 text-white/80 transition-colors hover:border-gold-400 hover:text-gold-200"
            >
              {p.label}
            </Link>
          ))}
        </div>

        <ul className="mt-14 grid max-w-4xl gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
          {TRUST.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-start gap-3 text-sm leading-snug text-white/75">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
