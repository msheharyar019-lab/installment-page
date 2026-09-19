-- Run this file in Supabase SQL Editor.
-- It creates the authenticated user's installment accounts and payment history.

create extension if not exists pgcrypto;

create table if not exists public.installment_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_no text not null,
  record_date date not null default current_date,
  customer_name text not null,
  address text,
  mobile_no_1 text,
  mobile_no_2 text,
  cnic_adhar text,
  nationality text,
  profession text,
  product_details text,
  total_amount numeric(12, 2) not null default 0,
  advance_amount numeric(12, 2) not null default 0,
  installment_duration integer not null default 0,
  installment_type text,
  monthly_installment numeric(12, 2) not null default 0,
  guarantor_name text,
  guarantor_father_name text,
  guarantor_nationality text,
  guarantor_address text,
  guarantor_mobile text,
  created_at timestamptz not null default now(),
  unique (user_id, account_no)
);

create table if not exists public.installment_payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.installment_accounts(id) on delete cascade,
  payment_date date not null default current_date,
  month_name text not null,
  pay_amount numeric(12, 2) not null default 0,
  submitted_amount numeric(12, 2) not null default 0,
  remaining_amount numeric(12, 2) not null default 0,
  signature text,
  created_at timestamptz not null default now()
);

alter table public.installment_accounts enable row level security;
alter table public.installment_payments enable row level security;

drop policy if exists "Users can view their installment accounts" on public.installment_accounts;
drop policy if exists "Users can insert their installment accounts" on public.installment_accounts;
drop policy if exists "Users can update their installment accounts" on public.installment_accounts;
drop policy if exists "Users can delete their installment accounts" on public.installment_accounts;

create policy "Users can view their installment accounts"
  on public.installment_accounts for select using (auth.uid() = user_id);
create policy "Users can insert their installment accounts"
  on public.installment_accounts for insert with check (auth.uid() = user_id);
create policy "Users can update their installment accounts"
  on public.installment_accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their installment accounts"
  on public.installment_accounts for delete using (auth.uid() = user_id);

drop policy if exists "Users can view their installment payments" on public.installment_payments;
drop policy if exists "Users can insert their installment payments" on public.installment_payments;
drop policy if exists "Users can update their installment payments" on public.installment_payments;
drop policy if exists "Users can delete their installment payments" on public.installment_payments;

create policy "Users can view their installment payments"
  on public.installment_payments for select using (
    exists (
      select 1 from public.installment_accounts account
      where account.id = installment_payments.account_id
        and account.user_id = auth.uid()
    )
  );
create policy "Users can insert their installment payments"
  on public.installment_payments for insert with check (
    exists (
      select 1 from public.installment_accounts account
      where account.id = installment_payments.account_id
        and account.user_id = auth.uid()
    )
  );
create policy "Users can update their installment payments"
  on public.installment_payments for update using (
    exists (
      select 1 from public.installment_accounts account
      where account.id = installment_payments.account_id
        and account.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.installment_accounts account
      where account.id = installment_payments.account_id
        and account.user_id = auth.uid()
    )
  );
create policy "Users can delete their installment payments"
  on public.installment_payments for delete using (
    exists (
      select 1 from public.installment_accounts account
      where account.id = installment_payments.account_id
        and account.user_id = auth.uid()
    )
  );

-- Settings page: private signature image storage.
insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', false)
on conflict (id) do nothing;

drop policy if exists "Users can view their own signature" on storage.objects;
drop policy if exists "Users can upload their own signature" on storage.objects;
drop policy if exists "Users can update their own signature" on storage.objects;
drop policy if exists "Users can delete their own signature" on storage.objects;

create policy "Users can view their own signature"
  on storage.objects for select using (
    bucket_id = 'signatures' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload their own signature"
  on storage.objects for insert with check (
    bucket_id = 'signatures' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own signature"
  on storage.objects for update using (
    bucket_id = 'signatures' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own signature"
  on storage.objects for delete using (
    bucket_id = 'signatures' and auth.uid()::text = (storage.foldername(name))[1]
  );

