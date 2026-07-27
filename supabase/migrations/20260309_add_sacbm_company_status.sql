alter table public.sacbm_companies
  add column if not exists is_active boolean not null default true;

update public.sacbm_companies
set is_active = true
where is_active is null;
