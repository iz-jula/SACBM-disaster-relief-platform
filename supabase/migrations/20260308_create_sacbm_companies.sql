create table if not exists public.sacbm_companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  sector text,
  phone text,
  email text,
  website text,
  description text,
  logo_url text,
  created_by uuid references public.sacbm_members(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sacbm_members
  add column if not exists company_id uuid references public.sacbm_companies(id) on delete set null;

create index if not exists sacbm_members_company_id_idx on public.sacbm_members(company_id);

alter table public.sacbm_companies enable row level security;

create policy "Active SACBM members can view companies"
  on public.sacbm_companies for select
  using (exists (
    select 1 from public.sacbm_members viewer
    where viewer.user_id = auth.uid() and viewer.is_active = true
  ));

create policy "SACBM admins can create companies"
  on public.sacbm_companies for insert
  with check (exists (
    select 1 from public.sacbm_members admin_member
    where admin_member.user_id = auth.uid() and admin_member.role = 'admin' and admin_member.is_active = true
  ));

create policy "SACBM admins can update companies"
  on public.sacbm_companies for update
  using (exists (
    select 1 from public.sacbm_members admin_member
    where admin_member.user_id = auth.uid() and admin_member.role = 'admin' and admin_member.is_active = true
  ));

create policy "SACBM admins can delete companies"
  on public.sacbm_companies for delete
  using (exists (
    select 1 from public.sacbm_members admin_member
    where admin_member.user_id = auth.uid() and admin_member.role = 'admin' and admin_member.is_active = true
  ));

create or replace function public.set_sacbm_companies_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sacbm_companies_updated_at on public.sacbm_companies;
create trigger sacbm_companies_updated_at
before update on public.sacbm_companies
for each row execute function public.set_sacbm_companies_updated_at();
