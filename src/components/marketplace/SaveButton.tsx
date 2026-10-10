import { Heart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSavedIds, useToggleSaved } from '@/hooks/useSavedListings';
import { cn } from '@/lib/utils';

interface SaveButtonProps {
  assetId: string;
  title: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export function SaveButton({ assetId, title, variant = 'icon', className }: SaveButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: savedIds } = useSavedIds();
  const toggle = useToggleSaved();
  const saved = savedIds?.has(assetId) ?? false;

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    toggle.mutate({ assetId, saved });
  };

  const label = saved ? `Remove ${title} from saved listings` : `Save ${title}`;

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={label}
        disabled={toggle.isPending}
        className={cn(
          'inline-flex h-11 items-center justify-center gap-2 rounded-md border px-5 text-sm font-medium transition-colors',
          saved
            ? 'border-gold-400 bg-gold-50 text-gold-800'
            : 'border-navy-200 bg-white text-navy-900 hover:border-navy-400 hover:bg-navy-50',
          className,
        )}
      >
        <Heart className={cn('h-4 w-4', saved && 'fill-gold-500 text-gold-600')} aria-hidden="true" />
        {saved ? 'Saved' : 'Save listing'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      disabled={toggle.isPending}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 backdrop-blur transition-colors',
        saved ? 'border-gold-400 text-gold-600' : 'border-slate-200 text-slate-500 hover:text-navy-900',
        className,
      )}
    >
      <Heart className={cn('h-4 w-4', saved && 'fill-gold-500')} aria-hidden="true" />
    </button>
  );
}
