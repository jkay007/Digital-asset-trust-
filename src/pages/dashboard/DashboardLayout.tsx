import { FileText, Heart, LayoutDashboard, MessagesSquare, Shield, Target, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/Guards';
import { PanelLayout, type PanelNavItem } from '@/components/dashboard/PanelLayout';
import { Seo } from '@/components/seo/Seo';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/lib/constants';

function DashboardShell() {
  const { roles, hasRole, isStaff } = useAuth();
  const nav: PanelNavItem[] = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/saved', label: 'Saved listings', icon: Heart },
    { to: '/dashboard/enquiries', label: 'My enquiries', icon: MessagesSquare },
  ];
  if (hasRole('buyer')) nav.push({ to: '/dashboard/mandates', label: 'Acquisition mandates', icon: Target });
  if (hasRole('seller')) nav.push({ to: '/dashboard/submissions', label: 'Submissions', icon: FileText });
  nav.push({ to: '/dashboard/profile', label: 'Profile & access', icon: UserRound });

  return (
    <>
      <Seo title="Dashboard" noindex />
      <PanelLayout
        eyebrow="My account"
        title="Dashboard"
        nav={nav}
        aside={
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {roles.map((r) => (
                <Badge key={r} tone={r === 'admin' || r === 'reviewer' ? 'gold' : 'navy'}>
                  {ROLE_LABELS[r]}
                </Badge>
              ))}
            </div>
            {isStaff && (
              <Link to="/admin" className="flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-700">
                <Shield className="h-4 w-4" aria-hidden="true" /> Admin console
              </Link>
            )}
          </div>
        }
      />
    </>
  );
}

export default function DashboardLayout() {
  return (
    <RequireAuth>
      <DashboardShell />
    </RequireAuth>
  );
}
