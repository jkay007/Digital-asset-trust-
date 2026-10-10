import { useState, type ReactNode } from 'react';
import { Button, type ButtonProps } from './button';
import { Dialog, DialogContent } from './dialog';
import { Field } from './field';
import { Textarea } from './input';

interface ConfirmDialogProps {
  trigger: (open: () => void) => ReactNode;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  confirmVariant?: ButtonProps['variant'];
  /** When set, the dialog asks for text (reason / feedback / note). */
  input?: { label: string; required?: boolean; minLength?: number; hint?: string; placeholder?: string };
  onConfirm: (text: string) => Promise<unknown>;
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  confirmVariant = 'primary',
  input,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (input?.required && text.trim().length < (input.minLength ?? 1)) {
      setError(`Please enter at least ${input.minLength ?? 1} characters.`);
      return;
    }
    setBusy(true);
    try {
      await onConfirm(text.trim());
      setOpen(false);
      setText('');
      setError(undefined);
    } catch {
      // The caller reports errors (toast); keep the dialog open.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger(() => setOpen(true))}
      <DialogContent title={title} description={description}>
        {input && (
          <Field label={input.label} required={input.required} error={error} hint={input.hint}>
            <Textarea rows={4} value={text} placeholder={input.placeholder} onChange={(e) => setText(e.target.value)} />
          </Field>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={submit} loading={busy}>
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
