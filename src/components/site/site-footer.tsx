import { Link } from "@tanstack/react-router";

import { Logo } from "./site-header";

const columns = [
  {
    title: "Platform",
    links: [
      { to: "/how-it-works", label: "How it works" },
      { to: "/strategies", label: "Our strategies" },
      { to: "/performance", label: "Performance" },
      { to: "/transparency", label: "Transparency" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/why-digital-assets", label: "Why digital assets" },
      { to: "/track-record", label: "Track record & trust" },
      { to: "/compare", label: "How we compare" },
      { to: "/risk-management", label: "Risk management" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/terms", label: "Terms of use" },
      { to: "/privacy", label: "Privacy policy" },
      { to: "/risk-disclosure", label: "Risk disclosure" },
      { to: "/kyc-aml", label: "KYC / AML policy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Meridian Digital Asset Management provides access to professionally structured DeFi and
              digital-asset strategies built around data, diversification and disciplined risk management.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-4 rounded-lg border border-border/70 bg-background/50 p-5 text-xs leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">Risk warning.</strong> Digital assets are volatile and
            largely unregulated. The value of an investment can fall as well as rise and you may lose all
            capital invested. Any return figures shown across this site — including references to monthly
            targets — are targets, illustrative projections or historical figures. They are not guaranteed,
            not a promise of future performance, and not investment advice.
          </p>
          <p>
            Meridian Digital Asset Management is a demonstration platform. Nothing here constitutes an offer
            or solicitation in any jurisdiction where such an offer would be unlawful. Prospective investors
            should take independent advice and read the{" "}
            <Link to="/risk-disclosure" className="text-primary underline underline-offset-4">
              full risk disclosure
            </Link>
            .
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Meridian Digital Asset Management. All rights reserved.</p>
          <p>Capital at risk · No guaranteed returns · Illustrative figures throughout</p>
        </div>
      </div>
    </footer>
  );
}
