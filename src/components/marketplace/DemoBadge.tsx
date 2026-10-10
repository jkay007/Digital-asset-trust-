import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge
      tone="demo"
      className={cn('font-bold uppercase tracking-wider', className)}
      title="Demo listing: illustrative only, not a real business and not available for acquisition."
    >
      Demo listing
    </Badge>
  );
}
