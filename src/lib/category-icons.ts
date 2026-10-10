import {
  Bitcoin,
  Briefcase,
  Building2,
  ChartCandlestick,
  CreditCard,
  Dices,
  FileBadge,
  Landmark,
  Network,
  Umbrella,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  'credit-card': CreditCard,
  bitcoin: Bitcoin,
  'file-badge': FileBadge,
  'chart-candlestick': ChartCandlestick,
  briefcase: Briefcase,
  dices: Dices,
  network: Network,
  umbrella: Umbrella,
  building: Building2,
};

export function categoryIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || Building2;
}
