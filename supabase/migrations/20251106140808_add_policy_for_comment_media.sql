create policy "Allow authenticated users to upload comment media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'comment_media' 
  and auth.uid() = owner
);

create policy "Allow public read access to comment media"
on storage.objects
for select
using (bucket_id = 'comment_media');

create policy "Allow users to delete their own comment media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'comment_media'
  and auth.uid() = owner
);

create policy "Allow users to update their own comment media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'comment_media'
  and auth.uid() = owner
);
