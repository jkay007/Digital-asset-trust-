import { useRef, useState } from 'react';
import { Download, FileLock2, Trash2, Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Select } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { Skeleton } from '@/components/ui/skeleton';
import { errorMessage } from '@/components/ui/states';
import { useAuth } from '@/hooks/useAuth';
import { useSubmissionDocuments } from '@/hooks/useDashboard';
import { DOCUMENT_TYPES, labelFor } from '@/lib/constants';
import {
  ALLOWED_DOCUMENT_TYPES,
  deleteSubmissionDocument,
  openDocument,
  uploadSubmissionDocument,
  validateDocument,
  type DocumentType,
} from '@/lib/documents';
import { formatBytes, formatDate } from '@/lib/format';

interface DocumentsPanelProps {
  submissionId: string;
  editable: boolean;
}

export function DocumentsPanel({ submissionId, editable }: DocumentsPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: docs, isLoading, error } = useSubmissionDocuments(submissionId);
  const [docType, setDocType] = useState<DocumentType>('licence');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['submission-documents', submissionId] });

  const upload = async () => {
    if (!file || !user) return;
    const problem = validateDocument(file);
    if (problem) {
      setFileError(problem);
      return;
    }
    setBusy(true);
    try {
      await uploadSubmissionDocument({ userId: user.id, submissionId, file, documentType: docType });
      toast.success(`${file.name} uploaded to private storage`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (doc: { id: string; storage_path: string; file_name: string }) => {
    try {
      await deleteSubmissionDocument(doc);
      toast.success(`${doc.file_name} removed`);
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const open = async (id: string) => {
    setOpening(id);
    try {
      await openDocument(id);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setOpening(null);
    }
  };

  return (
    <section aria-labelledby="documents-heading" className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="flex items-center gap-2">
        <FileLock2 className="h-5 w-5 text-gold-600" aria-hidden="true" />
        <h2 id="documents-heading" className="text-lg font-semibold">
          Confidential documents
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-slate-600">
        Stored in private storage. Visible only to you and authorised reviewers; every reviewer access is logged. Documents
        are never published.
      </p>

      {error ? (
        <Notice tone="danger" className="mt-4">
          {errorMessage(error)}
        </Notice>
      ) : isLoading ? (
        <Skeleton className="mt-4 h-16" />
      ) : docs && docs.length > 0 ? (
        <ul className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {docs.map((d) => (
            <li key={d.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy-900">{d.file_name}</p>
                <p className="text-xs text-slate-500">
                  {labelFor([...DOCUMENT_TYPES], d.document_type as DocumentType)} · {formatBytes(d.size_bytes)} · {formatDate(d.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => open(d.id)} loading={opening === d.id}>
                  <Download className="h-4 w-4" aria-hidden="true" /> Open
                </Button>
                {editable && d.owner_id === user?.id && (
                  <Button variant="ghost" size="sm" onClick={() => remove(d)} aria-label={`Remove ${d.file_name}`}>
                    <Trash2 className="h-4 w-4 text-red-700" aria-hidden="true" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No documents uploaded yet.</p>
      )}

      {editable && (
        <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:grid-cols-[200px_1fr_auto] sm:items-end">
          <Field label="Document type">
            <Select value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)}>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="File" error={fileError} hint="PDF, Word, Excel, CSV, PNG or JPEG. Max 25 MB.">
            <input
              ref={inputRef}
              type="file"
              accept={Object.keys(ALLOWED_DOCUMENT_TYPES).join(',')}
              onChange={(e) => {
                setFileError(undefined);
                setFile(e.target.files?.[0] ?? null);
              }}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-navy-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-navy-700"
            />
          </Field>
          <Button onClick={upload} disabled={!file} loading={busy}>
            <Upload className="h-4 w-4" aria-hidden="true" /> Upload
          </Button>
        </div>
      )}
    </section>
  );
}
