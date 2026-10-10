import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LayoutDashboard, LogOut, Menu, Shield, Heart, UserRound, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { ButtonLink } from '@/components/ui/button';
import { primaryNav } from '@/config/site';
import { useAuth } from '@/hooks/useAuth';
import { cn, initials } from '@/lib/utils';

function UserMenu() {
  const { user, profile, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const name = profile?.full_name || user.email || 'Account';
  const item =
    'flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm text-navy-800 outline-none data-[highlighted]:bg-navy-50';
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 text-sm text-white hover:border-gold-400"
        aria-label="Account menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-xs font-semibold text-navy-950">
          {initials(profile?.full_name || user.email)}
        </span>
        <span className="hidden max-w-[10rem] truncate xl:inline">{name}</span>
        <ChevronDown className="h-4 w-4 opacity-70" aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[14rem] rounded-lg border border-slate-200 bg-white p-1.5 shadow-lift"
        >
          <div className="px-3 py-2 text-xs text-slate-500">
            Signed in as
            <div className="truncate text-sm font-medium text-navy-900">{user.email}</div>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
          <DropdownMenu.Item className={item} onSelect={() => navigate('/dashboard')}>
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" /> Dashboard
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onSelect={() => navigate('/dashboard/saved')}>
            <Heart className="h-4 w-4" aria-hidden="true" /> Saved listings
          </DropdownMenu.Item>
          <DropdownMenu.Item className={item} onSelect={() => navigate('/dashboard/profile')}>
            <UserRound className="h-4 w-4" aria-hidden="true" /> Profile
          </DropdownMenu.Item>
          {isStaff && (
            <DropdownMenu.Item className={item} onSelect={() => navigate('/admin')}>
              <Shield className="h-4 w-4" aria-hidden="true" /> Admin console
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
          <DropdownMenu.Item
            className={item}
            onSelect={async () => {
              await signOut();
              navigate('/');
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function SiteHeader() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative px-3 py-2 text-[0.9rem] font-medium transition-colors',
      isActive ? 'text-gold-300' : 'text-white/80 hover:text-white',
    );

  return (
    <header className="on-dark sticky top-0 z-40 border-b border-white/10 bg-navy-900">
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <Link to="/" className="shrink-0 rounded-md" aria-label="Global Financial Assets home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center lg:flex">
          {primaryNav.map((item) => (
            <NavLink key={item.href} to={item.href} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {!loading && !user && (
            <>
              <ButtonLink to="/login" variant="ghost-light" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink to="/register/buyer" variant="gold" size="sm">
                Register as buyer
              </ButtonLink>
            </>
          )}
          {user && <UserMenu />}
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            className="rounded-md p-2 text-white hover:bg-white/10 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-navy-950/70 lg:hidden" />
            <Dialog.Content className="on-dark fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-navy-900 p-6 shadow-2xl focus:outline-none lg:hidden">
              <div className="flex items-center justify-between">
                <Dialog.Title className="sr-only">Navigation</Dialog.Title>
                <Dialog.Description className="sr-only">Site navigation links</Dialog.Description>
                <Logo showWordmark={false} />
                <Dialog.Close className="rounded-md p-2 text-white hover:bg-white/10" aria-label="Close navigation menu">
                  <X className="h-6 w-6" aria-hidden="true" />
                </Dialog.Close>
              </div>
              <nav aria-label="Mobile" className="mt-8 flex flex-col">
                {primaryNav.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'border-b border-white/10 py-3.5 font-display text-lg',
                        isActive ? 'text-gold-300' : 'text-white',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto space-y-3 pt-8">
                {user ? (
                  <ButtonLink to="/dashboard" variant="gold" className="w-full">
                    Go to dashboard
                  </ButtonLink>
                ) : (
                  <>
                    <ButtonLink to="/register/buyer" variant="gold" className="w-full">
                      Register as buyer
                    </ButtonLink>
                    <ButtonLink to="/login" variant="outline-light" className="w-full">
                      Sign in
                    </ButtonLink>
                  </>
                )}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
