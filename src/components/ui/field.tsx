import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FieldProps {
  label: ReactNode;
  children: ReactElement<Record<string, unknown>>;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  /** Visually hide the label but keep it for assistive technology. */
  hideLabel?: boolean;
}

/**
 * Accessible form field: wires label, hint and error message to the control
 * via id / aria-describedby / aria-invalid.
 */
export function Field({ label, children, hint, error, required, className, hideLabel }: FieldProps) {
  const autoId = useId();
  const id = (children.props.id as string | undefined) ?? `f-${autoId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required || undefined,
      })
    : children;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className={cn('block text-sm font-medium text-navy-800', hideLabel && 'sr-only')}>
        {label}
        {required && (
          <span className="ml-0.5 text-red-700" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="text-xs leading-relaxed text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

interface CheckboxFieldProps {
  label: ReactNode;
  children: ReactElement<Record<string, unknown>>;
  error?: string;
  description?: ReactNode;
  className?: string;
}

export function CheckboxField({ label, children, error, description, className }: CheckboxFieldProps) {
  const autoId = useId();
  const id = (children.props.id as string | undefined) ?? `c-${autoId}`;
  const errorId = error ? `${id}-error` : undefined;
  const control = cloneElement(children, {
    id,
    'aria-describedby': errorId,
    'aria-invalid': error ? true : undefined,
  });
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-start gap-3">
        <div className="pt-0.5">{control}</div>
        <label htmlFor={id} className="text-sm leading-relaxed text-slate-700">
          {label}
          {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="pl-7 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
