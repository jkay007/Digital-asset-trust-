import { Link } from "@tanstack/react-router";
import { Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";

const nav = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/strategies", label: "Strategies" },
  { to: "/performance", label: "Performance" },
  { to: "/track-record", label: "Track record" },
  { to: "/why-meridian", label: "Why us" },
  { to: "/compare", label: "Compare" },
  { to: "/risk-management", label: "Risk" },
  { to: "/transparency", label: "Transparency" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Meridian Digital Asset Management home">
      <span className="flex size-8 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
        <ShieldCheck className="size-4 text-primary" aria-hidden />
      </span>
      {!compact && (
        <span className="font-display text-sm font-semibold tracking-[0.16em] uppercase">
          Meridian<span className="text-primary">·</span>DAM
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const { currentUser } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <Logo />
        <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
              activeProps={{ className: "text-foreground bg-secondary/60" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {currentUser ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Investor dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Create account</Link>
              </Button>
            </>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-card">
              <SheetTitle className="px-4 pt-4 text-sm uppercase tracking-widest text-muted-foreground">
                Navigation
              </SheetTitle>
              <nav className="mt-4 flex flex-col gap-1 px-2 pb-6" aria-label="Mobile">
                {nav.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    activeProps={{ className: "text-foreground bg-secondary/60" }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                >
                  Login
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
