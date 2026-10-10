import type {
  AppRole,
  AssetStatus,
  EnquiryStatus,
  MandateStatus,
  OperatingStatus,
  SubmissionStatus,
  TransactionType,
  VerificationLevel,
} from '@/integrations/supabase/types';

export const TRANSACTION_TYPES: { value: TransactionType; label: string; description: string }[] = [
  { value: 'full_acquisition', label: 'Full acquisition (100%)', description: 'Sale of the entire share capital.' },
  { value: 'majority_stake', label: 'Majority stake', description: 'Controlling interest of more than 50%.' },
  { value: 'minority_stake', label: 'Minority stake', description: 'Non-controlling investment.' },
  { value: 'asset_purchase', label: 'Asset purchase', description: 'Purchase of a business, book or platform, not the shares.' },
  { value: 'merger', label: 'Merger', description: 'Combination with another business.' },
  { value: 'joint_venture', label: 'Joint venture', description: 'Strategic partnership or shared ownership vehicle.' },
];

export const OPERATING_STATUSES: { value: OperatingStatus; label: string; description: string }[] = [
  { value: 'operating', label: 'Operating', description: 'Trading with active clients.' },
  { value: 'pre_launch', label: 'Licensed, pre-launch', description: 'Authorised but not yet trading.' },
  { value: 'dormant', label: 'Dormant', description: 'Authorised, with limited or no current activity.' },
  { value: 'licence_pending', label: 'Licence application pending', description: 'Application filed and under regulator review.' },
];

export const VERIFICATION_LEVELS: {
  value: VerificationLevel;
  label: string;
  rank: number;
  description: string;
}[] = [
  {
    value: 'unverified',
    label: 'Unverified',
    rank: 0,
    description:
      'No independent checks have been recorded. Information is as provided by the seller.',
  },
  {
    value: 'company_checked',
    label: 'Company Checked',
    rank: 1,
    description:
      'An authorised reviewer has checked that the company exists and is in good standing on the relevant companies register.',
  },
  {
    value: 'regulator_record_checked',
    label: 'Regulator Record Checked',
    rank: 2,
    description:
      'An authorised reviewer has matched the stated licence or registration against the regulator’s public record.',
  },
  {
    value: 'documents_reviewed',
    label: 'Documents Reviewed',
    rank: 3,
    description:
      'An authorised reviewer has reviewed supporting corporate and regulatory documents provided by the seller.',
  },
];

export const ASSET_STATUSES: { value: AssetStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'approved', label: 'Approved (unpublished)' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
  { value: 'sold', label: 'Sold' },
];

export const SUBMISSION_STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under review' },
  { value: 'changes_requested', label: 'Changes requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export const ENQUIRY_STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'responded', label: 'Responded' },
  { value: 'closed', label: 'Closed' },
  { value: 'spam', label: 'Spam' },
];

export const MANDATE_STATUSES: { value: MandateStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
];

export const ROLE_LABELS: Record<AppRole, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  reviewer: 'Reviewer',
  admin: 'Administrator',
};

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'AED', 'SGD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const BUYER_TYPES = [
  { value: 'strategic', label: 'Strategic / corporate acquirer' },
  { value: 'private_equity', label: 'Private equity or investment fund' },
  { value: 'family_office', label: 'Family office' },
  { value: 'financial_institution', label: 'Bank or financial institution' },
  { value: 'entrepreneur', label: 'Entrepreneur / private individual' },
  { value: 'advisor', label: 'Advisor acting for a principal' },
  { value: 'other', label: 'Other' },
] as const;

export const DOCUMENT_TYPES = [
  { value: 'licence', label: 'Licence or authorisation' },
  { value: 'corporate', label: 'Corporate documents' },
  { value: 'financial', label: 'Financial statements' },
  { value: 'regulatory', label: 'Regulatory correspondence' },
  { value: 'other', label: 'Other supporting document' },
] as const;

/** Preset price bands (EUR equivalent) used by the marketplace filters. */
export const PRICE_BANDS = [
  { value: '0', label: 'No minimum' },
  { value: '250000', label: '€250k' },
  { value: '500000', label: '€500k' },
  { value: '1000000', label: '€1m' },
  { value: '2500000', label: '€2.5m' },
  { value: '5000000', label: '€5m' },
  { value: '10000000', label: '€10m' },
  { value: '25000000', label: '€25m' },
  { value: '50000000', label: '€50m' },
  { value: '100000000', label: '€100m' },
] as const;

export const PAGE_SIZE = 12;

export function labelFor<T extends string>(list: { value: T; label: string }[], value: T | null | undefined) {
  return list.find((i) => i.value === value)?.label ?? value ?? '';
}
