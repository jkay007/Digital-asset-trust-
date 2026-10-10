import { useState } from 'react';
import { StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { unwrap, useAdminAction, useStaffNotes, type NoteTarget } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { formatDateTime } from '@/lib/format';

export function StaffNotesPanel({ target, title = 'Internal notes' }: { target: NoteTarget; title?: string }) {
  const { user } = useAuth();
  const { data, isLoading } = useStaffNotes(target);
  const [body, setBody] = useState('');
  const add = useAdminAction(
    (text: string) => unwrap(supabase.from('staff_notes').insert({ ...target, body: text })),
    'Note added',
  );
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-card" aria-labelledby="notes-heading">
      <h2 id="notes-heading" className="flex items-center gap-2 text-lg font-semibold">
        <StickyNote className="h-4 w-4 text-gold-600" aria-hidden="true" /> {title}
      </h2>
      <p className="mt-1 text-xs text-slate-500">Visible to staff only. Notes cannot be edited or deleted.</p>
      <form
        className="mt-4 space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (body.trim()) add.mutate(body.trim(), { onSuccess: () => setBody('') });
        }}
      >
        <label htmlFor="staff-note" className="sr-only">
          New note
        </label>
        <Textarea id="staff-note" rows={3} value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} placeholder="Add a note…" />
        <div className="flex justify-end">
          <Button type="submit" size="sm" variant="outline" disabled={!body.trim()} loading={add.isPending}>
            Add note
          </Button>
        </div>
      </form>
      {isLoading ? (
        <Skeleton className="mt-4 h-12" />
      ) : data && data.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {data.map((n) => (
            <li key={n.id} className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
              <p className="whitespace-pre-line text-slate-800">{n.body}</p>
              <p className="mt-1.5 text-xs text-slate-500">
                {n.author_id === user?.id ? 'You' : 'Staff member'} · {formatDateTime(n.created_at)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No notes yet.</p>
      )}
    </section>
  );
}
