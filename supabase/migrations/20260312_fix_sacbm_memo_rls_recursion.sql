drop policy if exists "sacbm_memos_access" on public.sacbm_memos;
drop policy if exists "Governance members can view memos" on public.sacbm_memos;
drop policy if exists "Governance members can create memos" on public.sacbm_memos;
drop policy if exists "Governance members can update memos" on public.sacbm_memos;

drop policy if exists "sacbm_memo_recipients_access" on public.sacbm_memo_recipients;

create policy "Governance members can view memos"
on public.sacbm_memos
for select
to authenticated
using ((select private.sacbm_is_governance_member()));

create policy "Governance members can create memos"
on public.sacbm_memos
for insert
to authenticated
with check ((select private.sacbm_is_governance_member()));

create policy "Governance members can update memos"
on public.sacbm_memos
for update
to authenticated
using ((select private.sacbm_is_governance_member()))
with check ((select private.sacbm_is_governance_member()));

create policy "Governance members can view memo recipients"
on public.sacbm_memo_recipients
for select
to authenticated
using ((select private.sacbm_is_governance_member()));

create policy "Governance members can create memo recipients"
on public.sacbm_memo_recipients
for insert
to authenticated
with check ((select private.sacbm_is_governance_member()));

create policy "Governance members can update memo recipients"
on public.sacbm_memo_recipients
for update
to authenticated
using ((select private.sacbm_is_governance_member()))
with check ((select private.sacbm_is_governance_member()));
