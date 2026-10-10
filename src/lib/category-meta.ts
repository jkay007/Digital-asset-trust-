import type { LucideIcon } from 'lucide-react';
import { categoryIcon } from './category-icons';

/**
 * Static fallback mapping from category slug to icon name, so cards can render
 * an icon from view data without an extra lookup. The database `icon` column is
 * the source of truth for category pages.
 */
const SLUG_ICON: Record<string, string> = {
  'banks-financial-institutions': 'landmark',
  'payments-emis': 'credit-card',
  'crypto-digital-assets': 'bitcoin',
  'financial-licences': 'file-badge',
  'forex-brokerage': 'chart-candlestick',
  'investment-firms-funds': 'briefcase',
  'casino-igaming': 'dices',
  'payment-gateways-banking-infrastructure': 'network',
  insurance: 'umbrella',
  'other-financial-businesses': 'building',
};

export function categoryIconBySlug(slug: string | null | undefined): LucideIcon {
  return categoryIcon(slug ? SLUG_ICON[slug] : undefined);
}
