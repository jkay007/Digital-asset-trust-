import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { Checkbox, Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ErrorState } from '@/components/ui/states';
import { Table, TableWrap, Td, Th, THead, Tr } from '@/components/ui/table';
import { unwrap, useAdminAction, useAdminUsers } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/integrations/supabase/types';
import { ROLE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { AdminOnly } from './AdminLayout';

const ROLES: AppRole[] = ['buyer', 'seller', 'reviewer', 'admin'];

function Users() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useAdminUsers();
  const [q, setQ] = useState('');
  const setRole = useAdminAction(
    ({ userId, role, grant }: { userId: string; role: AppRole; grant: boolean }) =>
      unwrap(supabase.rpc('set_user_role', { p_user_id: userId, p_role: role, p_grant: grant })),
    ({ role, grant }) => `${ROLE_LABELS[role]} role ${grant ? 'granted' : 'revoked'}`,
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (u) => !term || [u.email, u.full_name, u.company_name].some((v) => v?.toLowerCase().includes(term)),
    );
  }, [data, q]);

  return (
    <div>
      <PanelHeader
        title="Users & roles"
        description="Grant reviewer or administrator access only to trusted staff. Every change is written to the audit log."
      />
      <div className="relative mb-5 max-w-md">
        <label htmlFor="user-q" className="sr-only">
          Search users
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <Input id="user-q" className="pl-9" placeholder="Search name, email or company" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <Th>User</Th>
                {ROLES.map((r) => (
                  <Th key={r} className="text-center">
                    {ROLE_LABELS[r]}
                  </Th>
                ))}
                <Th>Joined</Th>
                <Th>Last sign-in</Th>
              </tr>
            </THead>
            <tbody>
              {rows.map((u) => (
                <Tr key={u.id}>
                  <Td>
                    <p className="font-medium text-navy-900">{u.full_name || '—'}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                    {u.company_name && <p className="text-xs text-slate-500">{u.company_name}</p>}
                  </Td>
                  {ROLES.map((role) => {
                    const has = u.roles.includes(role);
                    const self = u.id === user?.id && role === 'admin';
                    const privileged = role === 'admin' || role === 'reviewer';
                    return (
                      <Td key={role} className="text-center">
                        <ConfirmDialog
                          title={`${has ? 'Revoke' : 'Grant'} ${ROLE_LABELS[role]} role`}
                          description={
                            privileged && !has
                              ? `${u.email} will gain ${ROLE_LABELS[role].toLowerCase()} access, including confidential seller information.`
                              : `Change ${ROLE_LABELS[role].toLowerCase()} access for ${u.email}.`
                          }
                          confirmLabel={has ? 'Revoke' : 'Grant'}
                          confirmVariant={has ? 'danger' : 'primary'}
                          onConfirm={() => setRole.mutateAsync({ userId: u.id, role, grant: !has })}
                          trigger={(open) => (
                            <Checkbox
                              checked={has}
                              disabled={self}
                              onChange={open}
                              aria-label={`${ROLE_LABELS[role]} role for ${u.email}`}
                              title={self ? 'You cannot remove your own administrator role' : undefined}
                            />
                          )}
                        />
                      </Td>
                    );
                  })}
                  <Td className="whitespace-nowrap">{formatDate(u.created_at)}</Td>
                  <Td className="whitespace-nowrap">{formatDate(u.last_sign_in_at)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminOnly>
      <Users />
    </AdminOnly>
  );
}
