import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PanelHeader } from '@/components/dashboard/PanelLayout';
import { usePageMetadata } from '@/components/seo/Seo';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckboxField, Field } from '@/components/ui/field';
import { Checkbox, Input, Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableWrap, Td, Th, THead, Tr } from '@/components/ui/table';
import { unwrap, useAdminAction } from '@/hooks/useAdmin';
import { useCategories, useJurisdictions } from '@/hooks/useReferenceData';
import { supabase } from '@/integrations/supabase/client';
import type { PageMetadata } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import { AdminOnly } from './AdminLayout';
import { useQueryClient } from '@tanstack/react-query';

const PATH_RE = /^\/[a-z0-9/_-]*$/;

function PageMetaDialog({ initial, onClose }: { initial: Partial<PageMetadata> | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [path, setPath] = useState(initial?.path ?? '/');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [image, setImage] = useState(initial?.og_image_url ?? '');
  const [noindex, setNoindex] = useState(initial?.noindex ?? false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEdit = Boolean(initial?.path);

  const save = useAdminAction(async () => {
    const row = {
      path,
      title: title.trim() || null,
      description: description.trim() || null,
      og_image_url: image.trim() || null,
      noindex,
    };
    return unwrap(supabase.from('page_metadata').upsert(row, { onConflict: 'path' }));
  }, 'Page metadata saved');

  const submit = () => {
    const next: Record<string, string> = {};
    if (!PATH_RE.test(path)) next.path = 'Use a site path such as /marketplace (lowercase letters, numbers, /, - and _).';
    if (title.length > 120) next.title = 'Keep titles under 120 characters (about 60 is ideal).';
    if (description.length > 320) next.description = 'Keep descriptions under 320 characters (about 155 is ideal).';
    if (image && !image.startsWith('https://')) next.image = 'Image URLs must start with https://';
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate(undefined, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['page_metadata'] });
        onClose();
      },
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={isEdit ? `Edit ${initial?.path}` : 'Add page metadata'} description="Overrides the default title and description for one path.">
        <div className="space-y-4">
          <Field label="Path" required error={errors.path}>
            <Input value={path} disabled={isEdit} onChange={(e) => setPath(e.target.value.toLowerCase())} />
          </Field>
          <Field label="Title" error={errors.title} hint={`${title.length}/120 · the site name is appended automatically`}>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Description" error={errors.description} hint={`${description.length}/320`}>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Social image URL" error={errors.image}>
            <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://" />
          </Field>
          <CheckboxField label="Hide this page from search engines (noindex)">
            <Checkbox checked={noindex} onChange={(e) => setNoindex(e.target.checked)} />
          </CheckboxField>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={submit} loading={save.isPending}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PageMetaTab() {
  const { data, isLoading } = usePageMetadata();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Partial<PageMetadata> | null | undefined>(undefined);
  const remove = useAdminAction((path: string) => unwrap(supabase.from('page_metadata').delete().eq('path', path)), 'Override removed');
  const rows = data ? [...data.values()].sort((a, b) => a.path.localeCompare(b.path)) : [];
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add override
        </Button>
      </div>
      {isLoading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
          No overrides. Pages use their built-in titles and descriptions.
        </p>
      ) : (
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <Th>Path</Th>
                <Th>Title</Th>
                <Th>Description</Th>
                <Th>Index</Th>
                <Th>
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </THead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.path}>
                  <Td className="font-mono text-xs">{r.path}</Td>
                  <Td className="text-xs">{r.title || '—'}</Td>
                  <Td className="max-w-xs text-xs">{r.description || '—'}</Td>
                  <Td className="text-xs">{r.noindex ? 'noindex' : 'index'}</Td>
                  <Td className="whitespace-nowrap text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(r)} aria-label={`Edit ${r.path}`}>
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <ConfirmDialog
                      title={`Remove override for ${r.path}?`}
                      confirmLabel="Remove"
                      confirmVariant="danger"
                      onConfirm={async () => {
                        await remove.mutateAsync(r.path);
                        await queryClient.invalidateQueries({ queryKey: ['page_metadata'] });
                      }}
                      trigger={(open) => (
                        <Button variant="ghost" size="sm" onClick={open} aria-label={`Remove ${r.path}`}>
                          <Trash2 className="h-4 w-4 text-red-700" aria-hidden="true" />
                        </Button>
                      )}
                    />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
      {editing !== undefined && <PageMetaDialog initial={editing} onClose={() => setEditing(undefined)} />}
    </div>
  );
}

interface TaxonomyRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  seo_title: string | null;
  seo_description: string | null;
}

function TaxonomyDialog({ table, row, onClose }: { table: 'categories' | 'jurisdictions'; row: TaxonomyRow; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState(row.description);
  const [seoTitle, setSeoTitle] = useState(row.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(row.seo_description ?? '');
  const save = useAdminAction(
    () =>
      unwrap(
        supabase
          .from(table)
          .update({ description: description.trim(), seo_title: seoTitle.trim() || null, seo_description: seoDescription.trim() || null })
          .eq('id', row.id),
      ),
    `${row.name} updated`,
  );
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent title={`Edit ${row.name}`} description={`/${table}/${row.slug}`}>
        <div className="space-y-4">
          <Field label="Description" hint="Shown on cards and as the default meta description.">
            <Textarea rows={3} maxLength={table === 'categories' ? 600 : 1000} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="SEO title" hint={`${seoTitle.length}/120`}>
            <Input maxLength={120} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          </Field>
          <Field label="SEO description" hint={`${seoDescription.length}/320`}>
            <Textarea rows={3} maxLength={320} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              loading={save.isPending}
              onClick={() =>
                save.mutate(undefined, {
                  onSuccess: async () => {
                    await queryClient.invalidateQueries({ queryKey: [table] });
                    onClose();
                  },
                })
              }
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TaxonomyTab({ table }: { table: 'categories' | 'jurisdictions' }) {
  const categories = useCategories();
  const jurisdictions = useJurisdictions();
  const query = table === 'categories' ? categories : jurisdictions;
  const [editing, setEditing] = useState<TaxonomyRow | null>(null);
  if (query.isLoading) return <Skeleton className="h-48 rounded-xl" />;
  return (
    <>
      <TableWrap>
        <Table>
          <THead>
            <tr>
              <Th>Name</Th>
              <Th>SEO title</Th>
              <Th>SEO description</Th>
              <Th>
                <span className="sr-only">Edit</span>
              </Th>
            </tr>
          </THead>
          <tbody>
            {(query.data as TaxonomyRow[] | undefined)?.map((r) => (
              <Tr key={r.id}>
                <Td className="font-medium text-navy-900">
                  {r.name}
                  <span className="block font-mono text-[0.7rem] text-slate-400">/{table}/{r.slug}</span>
                </Td>
                <Td className="text-xs">{r.seo_title || <span className="text-slate-400">Default</span>}</Td>
                <Td className="max-w-sm text-xs">{r.seo_description || <span className="text-slate-400">Default</span>}</Td>
                <Td className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(r)} aria-label={`Edit ${r.name}`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
      {editing && <TaxonomyDialog table={table} row={editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function Metadata() {
  const [tab, setTab] = useState<'pages' | 'categories' | 'jurisdictions'>('pages');
  const tabs = [
    { id: 'pages', label: 'Page metadata' },
    { id: 'categories', label: 'Categories' },
    { id: 'jurisdictions', label: 'Jurisdictions' },
  ] as const;
  return (
    <div>
      <PanelHeader title="SEO & metadata" description="Edit page titles, descriptions and indexing. Changes apply immediately for new page views." />
      <div role="tablist" aria-label="Metadata sections" className="mb-6 flex gap-1 rounded-lg bg-white p-1 shadow-card">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex-1 rounded-md px-3 py-2 text-sm font-medium',
              tab === t.id ? 'bg-navy-900 text-white' : 'text-slate-600 hover:bg-slate-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'pages' ? <PageMetaTab /> : <TaxonomyTab table={tab} />}
      </div>
    </div>
  );
}

export default function AdminMetadataPage() {
  return (
    <AdminOnly>
      <Metadata />
    </AdminOnly>
  );
}
