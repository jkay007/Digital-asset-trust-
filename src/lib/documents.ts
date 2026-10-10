import { supabase } from '@/integrations/supabase/client';
import { DOCUMENT_TYPES } from './constants';

export const DOCUMENT_BUCKET = 'confidential-documents';
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
export const ALLOWED_DOCUMENT_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'text/csv': 'CSV',
};
export type DocumentType = (typeof DOCUMENT_TYPES)[number]['value'];

export function validateDocument(file: File): string | null {
  if (!ALLOWED_DOCUMENT_TYPES[file.type]) return 'Unsupported file type. Upload PDF, Word, Excel, CSV, PNG or JPEG files.';
  if (file.size > MAX_DOCUMENT_BYTES) return 'Files must be 25 MB or smaller.';
  if (file.size === 0) return 'The file is empty.';
  return null;
}

export function sanitiseFileName(name: string): string {
  const cleaned = name.normalize('NFKD').replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');
  return cleaned.slice(-120) || 'document';
}

/**
 * Uploads to private storage under <uid>/<submission>/ and records the document.
 * Storage policies only accept uploads into the caller's own folder for their own
 * editable submission. If the database insert fails, the object is removed.
 */
export async function uploadSubmissionDocument(params: {
  userId: string;
  submissionId: string;
  file: File;
  documentType: DocumentType;
}) {
  const { userId, submissionId, file, documentType } = params;
  const problem = validateDocument(file);
  if (problem) throw new Error(problem);
  const path = `${userId}/${submissionId}/${crypto.randomUUID()}-${sanitiseFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;
  const { error: rowError } = await supabase.from('submission_documents').insert({
    submission_id: submissionId,
    storage_path: path,
    file_name: file.name.slice(0, 255),
    mime_type: file.type,
    size_bytes: file.size,
    document_type: documentType,
  });
  if (rowError) {
    await supabase.storage.from(DOCUMENT_BUCKET).remove([path]);
    throw rowError;
  }
}

export async function deleteSubmissionDocument(doc: { id: string; storage_path: string }) {
  const { error: rowError } = await supabase.from('submission_documents').delete().eq('id', doc.id);
  if (rowError) throw rowError;
  const { error: objectError } = await supabase.storage.from(DOCUMENT_BUCKET).remove([doc.storage_path]);
  if (objectError) throw objectError;
}

/**
 * Opens a confidential document through the document-access Edge Function, which
 * authorises the request with RLS, logs the access and returns a 60-second URL.
 */
export async function openDocument(documentId: string) {
  const { data, error } = await supabase.functions.invoke<{ url: string }>('document-access', {
    body: { document_id: documentId },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('No download link was returned.');
  const a = document.createElement('a');
  a.href = data.url;
  a.rel = 'noopener noreferrer';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
