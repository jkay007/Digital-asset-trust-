import {
  ClipboardList,
  FileSearch,
  Gauge,
  History,
  Inbox,
  Landmark,
  Search,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';
import { RequireAuth, RequireRole } from '@/components/auth/Guards';
import { PanelLayout, type PanelNavItem } from '@/components/dashboard/PanelLayout';
import { Seo } from '@/components/seo/Seo';
import { Notice } from '@/components/ui/notice';
import { useAuth } from '@/hooks/useAuth';

function AdminShell() {
  const { isAdmin } = useAuth();
  const nav: PanelNavItem[] = [
    { to: '/admin', label: 'Overview', icon: Gauge, end: true },
    { to: '/admin/submissions', label: 'Submissions', icon: ClipboardList },
    { to: '/admin/listings', label: 'Listings', icon: Landmark },
    { to: '/admin/verification', label: 'Verification', icon: ShieldCheck },
  ];
  if (isAdmin) {
    nav.push(
      { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
      { to: '/admin/mandates', label: 'Mandates', icon: Target },
      { to: '/admin/users', label: 'Users & roles', icon: Users },
      { to: '/admin/metadata', label: 'SEO & metadata', icon: Search },
      { to: '/admin/audit', label: 'Audit log', icon: History },
    );
  }
  return (
    <>
      <Seo title="Admin console" noindex />
      <PanelLayout
        eyebrow={isAdmin ? 'Administrator' : 'Reviewer'}
        title="Admin console"
        nav={nav}
        aside={
          <Notice tone="info">
            <span className="flex gap-2 text-xs">
              <FileSearch className="h-4 w-4 shrink-0" aria-hidden="true" />
              Every action here is checked by the database and recorded in the audit log.
            </span>
          </Notice>
        }
      />
    </>
  );
}

export default function AdminLayout() {
  return (
    <RequireAuth>
      <RequireRole roles={['admin', 'reviewer']}>
        <AdminShell />
      </RequireRole>
    </RequireAuth>
  );
}

export function AdminOnly({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={['admin']}>{children}</RequireRole>;
}
