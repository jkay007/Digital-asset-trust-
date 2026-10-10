import { Badge, type BadgeProps } from '@/components/ui/badge';
import type { AssetStatus, EnquiryStatus, MandateStatus, SubmissionStatus } from '@/integrations/supabase/types';
import { ASSET_STATUSES, ENQUIRY_STATUSES, MANDATE_STATUSES, SUBMISSION_STATUSES, labelFor } from '@/lib/constants';

type Tone = BadgeProps['tone'];

const ASSET_TONE: Record<AssetStatus, Tone> = {
  draft: 'neutral',
  pending_review: 'warning',
  approved: 'info',
  published: 'success',
  rejected: 'danger',
  archived: 'neutral',
  sold: 'navy',
};
const SUBMISSION_TONE: Record<SubmissionStatus, Tone> = {
  draft: 'neutral',
  submitted: 'info',
  under_review: 'warning',
  changes_requested: 'warning',
  approved: 'success',
  rejected: 'danger',
  withdrawn: 'neutral',
};
const ENQUIRY_TONE: Record<EnquiryStatus, Tone> = {
  new: 'info',
  in_review: 'warning',
  responded: 'success',
  closed: 'neutral',
  spam: 'danger',
};
const MANDATE_TONE: Record<MandateStatus, Tone> = { active: 'success', paused: 'warning', closed: 'neutral' };

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  return <Badge tone={ASSET_TONE[status]}>{labelFor(ASSET_STATUSES, status)}</Badge>;
}
export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return <Badge tone={SUBMISSION_TONE[status]}>{labelFor(SUBMISSION_STATUSES, status)}</Badge>;
}
export function EnquiryStatusBadge({ status }: { status: EnquiryStatus }) {
  return <Badge tone={ENQUIRY_TONE[status]}>{labelFor(ENQUIRY_STATUSES, status)}</Badge>;
}
export function MandateStatusBadge({ status }: { status: MandateStatus }) {
  return <Badge tone={MANDATE_TONE[status]}>{labelFor(MANDATE_STATUSES, status)}</Badge>;
}
