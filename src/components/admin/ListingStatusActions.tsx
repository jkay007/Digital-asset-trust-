import { Archive, BadgeCheck, CircleDollarSign, Eye, EyeOff, RotateCcw, Undo2, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { unwrap, useAdminAction } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import type { AssetStatus } from '@/integrations/supabase/types';

interface Transition {
  to: AssetStatus;
  label: string;
  icon: LucideIcon;
  variant?: ButtonProps['variant'];
  description: string;
}

/** Mirrors the state machine enforced by public.set_asset_status(). */
export const TRANSITIONS: Record<AssetStatus, Transition[]> = {
  draft: [
    { to: 'approved', label: 'Approve', icon: BadgeCheck, variant: 'primary', description: 'Record your administrator approval. The listing stays unpublished until you publish it.' },
    { to: 'pending_review', label: 'Mark pending review', icon: RotateCcw, description: 'Flag the draft for review.' },
    { to: 'rejected', label: 'Reject', icon: XCircle, variant: 'danger-outline', description: 'Reject this listing.' },
  ],
  pending_review: [
    { to: 'approved', label: 'Approve', icon: BadgeCheck, variant: 'primary', description: 'Record your administrator approval. The listing stays unpublished until you publish it.' },
    { to: 'draft', label: 'Return to draft', icon: Undo2, description: 'Move back to draft.' },
    { to: 'rejected', label: 'Reject', icon: XCircle, variant: 'danger-outline', description: 'Reject this listing.' },
  ],
  approved: [
    { to: 'published', label: 'Publish', icon: Eye, variant: 'gold', description: 'Make the listing visible on the public marketplace.' },
    { to: 'archived', label: 'Archive', icon: Archive, description: 'Archive without publishing.' },
    { to: 'draft', label: 'Revoke approval', icon: Undo2, description: 'Return to draft and clear the approval.' },
    { to: 'rejected', label: 'Reject', icon: XCircle, variant: 'danger-outline', description: 'Reject and clear the approval.' },
  ],
  published: [
    { to: 'sold', label: 'Mark as sold', icon: CircleDollarSign, variant: 'primary', description: 'Shows the listing as sold and closes enquiries.' },
    { to: 'approved', label: 'Unpublish', icon: EyeOff, description: 'Remove from the public marketplace but keep the approval.' },
    { to: 'archived', label: 'Archive', icon: Archive, description: 'Remove from the marketplace and archive.' },
  ],
  archived: [
    { to: 'published', label: 'Republish', icon: Eye, variant: 'gold', description: 'Make the listing public again.' },
    { to: 'approved', label: 'Restore as unpublished', icon: RotateCcw, description: 'Restore without publishing.' },
  ],
  sold: [
    { to: 'published', label: 'Reopen', icon: Eye, description: 'Return to the marketplace as available.' },
    { to: 'archived', label: 'Archive', icon: Archive, description: 'Archive the sold listing.' },
  ],
  rejected: [
    { to: 'draft', label: 'Return to draft', icon: Undo2, description: 'Move back to draft.' },
    { to: 'pending_review', label: 'Mark pending review', icon: RotateCcw, description: 'Flag for review.' },
  ],
};

export function ListingStatusActions({ assetId, status }: { assetId: string; status: AssetStatus }) {
  const change = useAdminAction(
    ({ to, note }: { to: AssetStatus; note: string }) =>
      unwrap(supabase.rpc('set_asset_status', { p_asset_id: assetId, p_status: to, p_note: note || null })),
    ({ to }) => `Listing ${to === 'published' ? 'published' : `moved to ${to.replace('_', ' ')}`}`,
  );
  return (
    <div className="flex flex-wrap gap-2">
      {TRANSITIONS[status].map((t) => (
        <ConfirmDialog
          key={t.to}
          title={t.label}
          description={t.description}
          confirmLabel={t.label}
          confirmVariant={t.variant === 'danger-outline' ? 'danger' : 'primary'}
          input={{ label: 'Note for the audit log (optional)' }}
          onConfirm={(note) => change.mutateAsync({ to: t.to, note })}
          trigger={(open) => (
            <Button size="sm" variant={t.variant ?? 'outline'} onClick={open}>
              <t.icon className="h-4 w-4" aria-hidden="true" /> {t.label}
            </Button>
          )}
        />
      ))}
    </div>
  );
}
