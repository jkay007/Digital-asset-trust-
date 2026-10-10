-- =============================================================================
-- Private storage for confidential seller documents
--
-- Objects are stored at:  <seller uid>/<submission id>/<random>-<file name>
--   * Sellers may upload only into their own folder, for their own submission,
--     while it is still editable.
--   * Sellers may read and delete only their own objects.
--   * Reviewers and administrators get NO direct storage access. They obtain a
--     60-second signed URL from the `document-access` Edge Function, which checks
--     authorisation through RLS and writes an audit-log entry for every access.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'confidential-documents',
  'confidential-documents',
  false,
  26214400, -- 25 MB
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Sellers upload documents to their own editable submissions"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'confidential-documents' and private.can_upload_document(name));

create policy "Document owners read their own documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'confidential-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Owners delete documents of editable submissions"
  on storage.objects for delete to authenticated
  using (bucket_id = 'confidential-documents' and private.can_upload_document(name));
