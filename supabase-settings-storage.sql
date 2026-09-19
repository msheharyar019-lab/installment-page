-- Run this separately in the Supabase SQL Editor for the Settings page.
-- It creates a private bucket for signature images and user-only access policies.

insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', false)
on conflict (id) do nothing;

drop policy if exists "Users can view their own signature" on storage.objects;
drop policy if exists "Users can upload their own signature" on storage.objects;
drop policy if exists "Users can update their own signature" on storage.objects;
drop policy if exists "Users can delete their own signature" on storage.objects;

create policy "Users can view their own signature"
  on storage.objects for select using (
    bucket_id = 'signatures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload their own signature"
  on storage.objects for insert with check (
    bucket_id = 'signatures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own signature"
  on storage.objects for update using (
    bucket_id = 'signatures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own signature"
  on storage.objects for delete using (
    bucket_id = 'signatures'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
