create extension if not exists pgcrypto;

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

alter table public.sacbm_companies
  add column if not exists is_active boolean not null default true;

update public.sacbm_companies
set is_active = true
where is_active is null;

create index if not exists sacbm_members_company_id_idx
  on public.sacbm_members(company_id);

create or replace function public.is_sacbm_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sacbm_members
    where user_id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

revoke all on function public.is_sacbm_admin() from public;
grant execute on function public.is_sacbm_admin() to authenticated;

create or replace function public.set_sacbm_company_updated_at()
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
for each row execute function public.set_sacbm_company_updated_at();

alter table public.sacbm_companies enable row level security;

drop policy if exists "Authenticated users can view SACBM companies" on public.sacbm_companies;
create policy "Authenticated users can view SACBM companies"
on public.sacbm_companies for select
to authenticated
using (true);

drop policy if exists "SACBM admins can create companies" on public.sacbm_companies;
create policy "SACBM admins can create companies"
on public.sacbm_companies for insert
to authenticated
with check (public.is_sacbm_admin());

drop policy if exists "SACBM admins can update companies" on public.sacbm_companies;
create policy "SACBM admins can update companies"
on public.sacbm_companies for update
to authenticated
using (public.is_sacbm_admin())
with check (public.is_sacbm_admin());

drop policy if exists "SACBM admins can delete companies" on public.sacbm_companies;
create policy "SACBM admins can delete companies"
on public.sacbm_companies for delete
to authenticated
using (public.is_sacbm_admin());

update public.sacbm_members members
set company_id = companies.id
from public.sacbm_companies companies
where members.company_id is null
  and lower(trim(members.company)) = lower(trim(companies.name));
