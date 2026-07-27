alter table public.sacbm_companies
  add column if not exists membership_tier text not null default 'bronze' check (membership_tier in ('bronze', 'gold', 'platinum'));

alter table public.sacbm_companies
  add column if not exists renewal_date date;
