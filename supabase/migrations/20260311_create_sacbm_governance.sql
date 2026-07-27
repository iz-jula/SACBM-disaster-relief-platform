create or replace function public.is_sacbm_governance_member()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.sacbm_members
    where user_id = auth.uid()
      and role in ('admin', 'board', 'exco')
      and is_active = true
  );
$$;

grant execute on function public.is_sacbm_governance_member() to authenticated;

create table if not exists public.sacbm_financial_records (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('receipt', 'invoice', 'contract')),
  amount numeric,
  record_date date not null default current_date,
  uploaded_by uuid not null references public.sacbm_members(id) on delete restrict,
  category text not null,
  file_path text not null,
  file_url text,
  file_size bigint,
  status text not null default 'approved' check (status in ('approved', 'pending', 'rejected')),
  approved_by uuid references public.sacbm_members(id) on delete set null,
  approved_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sacbm_authorization_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  requester_id uuid not null references public.sacbm_members(id) on delete restrict,
  amount numeric,
  type text not null check (type in ('payment', 'document-approval', 'event-approval', 'member-change')),
  request_date date not null default current_date,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  required_approvals integer not null default 1,
  approved_by uuid[] not null default '{}',
  pending_approvers uuid[] not null default '{}',
  deadline date,
  attachment_url text,
  rejection_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.sacbm_memos (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body text not null,
  sender_id uuid not null references public.sacbm_members(id) on delete restrict,
  recipient_ids uuid[] not null default '{}',
  read_by uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.sacbm_financial_records enable row level security;
alter table public.sacbm_authorization_requests enable row level security;
alter table public.sacbm_memos enable row level security;

create policy "Governance members can view financial records" on public.sacbm_financial_records for select to authenticated using (public.is_sacbm_governance_member());
create policy "Admins can create financial records" on public.sacbm_financial_records for insert to authenticated with check (public.is_sacbm_admin());
create policy "Admins can update financial records" on public.sacbm_financial_records for update to authenticated using (public.is_sacbm_admin()) with check (public.is_sacbm_admin());
create policy "Admins can delete financial records" on public.sacbm_financial_records for delete to authenticated using (public.is_sacbm_admin());

create policy "Governance members can view authorization requests" on public.sacbm_authorization_requests for select to authenticated using (public.is_sacbm_governance_member());
create policy "Governance members can create authorization requests" on public.sacbm_authorization_requests for insert to authenticated with check (public.is_sacbm_governance_member());
create policy "Governance members can update authorization requests" on public.sacbm_authorization_requests for update to authenticated using (public.is_sacbm_governance_member()) with check (public.is_sacbm_governance_member());

create policy "Governance members can view memos" on public.sacbm_memos for select to authenticated using (public.is_sacbm_governance_member());
create policy "Governance members can create memos" on public.sacbm_memos for insert to authenticated with check (public.is_sacbm_governance_member());
create policy "Governance members can update memos" on public.sacbm_memos for update to authenticated using (public.is_sacbm_governance_member()) with check (public.is_sacbm_governance_member());
