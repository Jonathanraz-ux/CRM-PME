-- ============================================================================
-- 0005_rls.sql
-- Row Level Security + policies par rôle (admin / manager / commercial /
-- employee / readonly)
--
-- Règles :
--   * admin        : tout (lecture + écriture + suppression) sur tout
--   * manager      : lecture totale + création/maj (pas de suppression sur
--                    profiles et company_settings)
--   * commercial   : lecture totale + écriture sur ses propres entités
--                    (leads, quotes, tasks, meetings, notes, activities,
--                     clients via la colonne *_by / assigned_to / author_id)
--   * employee     : lecture totale + écriture sur ses entités assignées
--   * readonly     : lecture seule
-- ============================================================================

-- Fonction de rôle de l'utilisateur courant.
-- security definer + search_path pour éviter la récursion RLS sur profiles.
create or replace function public.auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

comment on function public.auth_role() is 'Rôle du compte authentifié (RBAC).';

-- ---------------------------------------------------------------------------
-- Activation RLS sur toutes les tables
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.pipeline_stages   enable row level security;
alter table public.leads             enable row level security;
alter table public.clients           enable row level security;
alter table public.quotes            enable row level security;
alter table public.quote_items       enable row level security;
alter table public.activities        enable row level security;
alter table public.company_settings  enable row level security;
alter table public.contacts          enable row level security;
alter table public.product_categories enable row level security;
alter table public.products          enable row level security;
alter table public.services          enable row level security;
alter table public.tasks             enable row level security;
alter table public.meetings          enable row level security;
alter table public.notes             enable row level security;
alter table public.notifications     enable row level security;
alter table public.invoices          enable row level security;
alter table public.invoice_items     enable row level security;
alter table public.payments          enable row level security;

-- ---------------------------------------------------------------------------
-- Helpers de génération de policies (tables SANS colonne propriétaire)
-- ---------------------------------------------------------------------------
-- Lecture pour tout utilisateur authentifié
create policy read_profiles         on public.profiles         for select to authenticated using (true);
create policy read_pipeline_stages  on public.pipeline_stages  for select to authenticated using (true);
create policy read_leads            on public.leads            for select to authenticated using (true);
create policy read_clients          on public.clients          for select to authenticated using (true);
create policy read_quotes           on public.quotes           for select to authenticated using (true);
create policy read_quote_items      on public.quote_items      for select to authenticated using (true);
create policy read_activities       on public.activities       for select to authenticated using (true);
create policy read_company_settings on public.company_settings for select to authenticated using (true);
create policy read_contacts         on public.contacts         for select to authenticated using (true);
create policy read_product_cats     on public.product_categories for select to authenticated using (true);
create policy read_products         on public.products         for select to authenticated using (true);
create policy read_services         on public.services         for select to authenticated using (true);
create policy read_tasks            on public.tasks            for select to authenticated using (true);
create policy read_meetings         on public.meetings         for select to authenticated using (true);
create policy read_notes            on public.notes            for select to authenticated using (true);
create policy read_invoices         on public.invoices         for select to authenticated using (true);
create policy read_invoice_items    on public.invoice_items    for select to authenticated using (true);
create policy read_payments         on public.payments         for select to authenticated using (true);

-- admin : tout
create policy admin_all_profiles         on public.profiles         for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_pipeline_stages  on public.pipeline_stages  for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_leads            on public.leads            for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_clients          on public.clients          for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_quotes           on public.quotes           for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_quote_items      on public.quote_items      for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_activities       on public.activities       for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_company_settings on public.company_settings for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_contacts         on public.contacts         for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_product_cats     on public.product_categories for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_products         on public.products         for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_services         on public.services         for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_tasks            on public.tasks            for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_meetings         on public.meetings         for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_notes            on public.notes            for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_invoices         on public.invoices         for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_invoice_items    on public.invoice_items    for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');
create policy admin_all_payments         on public.payments         for all to authenticated using (public.auth_role()='admin') with check (public.auth_role()='admin');

-- manager : création + mise à jour (pas de suppression sur profiles/company_settings)
create policy mgr_write_pipeline_stages  on public.pipeline_stages  for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_pipeline_stages   on public.pipeline_stages  for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_leads           on public.leads           for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_leads             on public.leads           for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_clients         on public.clients         for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_clients           on public.clients         for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_quotes          on public.quotes          for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_quotes            on public.quotes          for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_quote_items     on public.quote_items      for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_quote_items       on public.quote_items      for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_activities      on public.activities       for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_activities        on public.activities       for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_contacts        on public.contacts         for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_contacts          on public.contacts         for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_product_cats    on public.product_categories for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_product_cats      on public.product_categories for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_products        on public.products         for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_products          on public.products         for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_services        on public.services         for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_services          on public.services         for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_tasks           on public.tasks            for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_tasks             on public.tasks            for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_meetings        on public.meetings         for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_meetings          on public.meetings         for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_notes           on public.notes            for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_notes             on public.notes            for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_invoices        on public.invoices         for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_invoices          on public.invoices         for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_invoice_items   on public.invoice_items    for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_invoice_items     on public.invoice_items    for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
create policy mgr_write_payments        on public.payments         for insert to authenticated with check (public.auth_role()='manager');
create policy mgr_upd_payments          on public.payments         for update to authenticated using (public.auth_role()='manager') with check (public.auth_role()='manager');
-- manager : suppression (sauf profiles & company_settings)
create policy mgr_del_pipeline_stages   on public.pipeline_stages  for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_leads             on public.leads            for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_clients           on public.clients          for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_quotes            on public.quotes           for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_quote_items       on public.quote_items      for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_activities        on public.activities       for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_contacts          on public.contacts         for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_product_cats      on public.product_categories for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_products          on public.products         for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_services          on public.services         for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_tasks             on public.tasks            for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_meetings          on public.meetings         for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_notes             on public.notes            for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_invoices          on public.invoices         for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_invoice_items     on public.invoice_items    for delete to authenticated using (public.auth_role()='manager');
create policy mgr_del_payments          on public.payments         for delete to authenticated using (public.auth_role()='manager');

-- ---------------------------------------------------------------------------
-- Policies "propriétaire" : commercial / employee écrit ses propres entités
-- ---------------------------------------------------------------------------
-- leads (created_by)
create policy owner_write_leads on public.leads for insert to authenticated with check (created_by = auth.uid());
create policy owner_mut_leads   on public.leads for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy owner_del_leads   on public.leads for delete to authenticated using (created_by = auth.uid());

-- clients (created_by)
create policy owner_write_clients on public.clients for insert to authenticated with check (created_by = auth.uid());
create policy owner_mut_clients   on public.clients for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy owner_del_clients   on public.clients for delete to authenticated using (created_by = auth.uid());

-- quotes (created_by)
create policy owner_write_quotes on public.quotes for insert to authenticated with check (created_by = auth.uid());
create policy owner_mut_quotes   on public.quotes for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy owner_del_quotes   on public.quotes for delete to authenticated using (created_by = auth.uid());

-- quote_items (via parent quote ownership)
create policy owner_write_quote_items on public.quote_items for insert to authenticated
  with check (exists (select 1 from public.quotes where id = quote_id and created_by = auth.uid()));
create policy owner_mut_quote_items on public.quote_items for update to authenticated
  using (exists (select 1 from public.quotes where id = quote_id and created_by = auth.uid()))
  with check (exists (select 1 from public.quotes where id = quote_id and created_by = auth.uid()));
create policy owner_del_quote_items on public.quote_items for delete to authenticated
  using (exists (select 1 from public.quotes where id = quote_id and created_by = auth.uid()));

-- invoice_items (via invoice → quote ownership)
create policy owner_write_invoice_items on public.invoice_items for insert to authenticated
  with check (exists (
    select 1 from public.invoices inv
    join public.quotes q on q.id = inv.quote_id
    where inv.id = invoice_id and q.created_by = auth.uid()
  ));
create policy owner_mut_invoice_items on public.invoice_items for update to authenticated
  using (exists (
    select 1 from public.invoices inv
    join public.quotes q on q.id = inv.quote_id
    where inv.id = invoice_id and q.created_by = auth.uid()
  ))
  with check (exists (
    select 1 from public.invoices inv
    join public.quotes q on q.id = inv.quote_id
    where inv.id = invoice_id and q.created_by = auth.uid()
  ));
create policy owner_del_invoice_items on public.invoice_items for delete to authenticated
  using (exists (
    select 1 from public.invoices inv
    join public.quotes q on q.id = inv.quote_id
    where inv.id = invoice_id and q.created_by = auth.uid()
  ));

-- activities (user_id)
create policy owner_write_activities on public.activities for insert to authenticated with check (user_id = auth.uid());
create policy owner_mut_activities   on public.activities for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_del_activities   on public.activities for delete to authenticated using (user_id = auth.uid());

-- tasks (assigned_to)
create policy owner_write_tasks on public.tasks for insert to authenticated with check (assigned_to = auth.uid());
create policy owner_mut_tasks   on public.tasks for update to authenticated using (assigned_to = auth.uid()) with check (assigned_to = auth.uid());
create policy owner_del_tasks   on public.tasks for delete to authenticated using (assigned_to = auth.uid());

-- meetings (created_by)
create policy owner_write_meetings on public.meetings for insert to authenticated with check (created_by = auth.uid());
create policy owner_mut_meetings   on public.meetings for update to authenticated using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy owner_del_meetings   on public.meetings for delete to authenticated using (created_by = auth.uid());

-- notes (author_id)
create policy owner_write_notes on public.notes for insert to authenticated with check (author_id = auth.uid());
create policy owner_mut_notes   on public.notes for update to authenticated using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy owner_del_notes   on public.notes for delete to authenticated using (author_id = auth.uid());

-- profiles : chacun gère son propre profil
create policy self_mut_profiles on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy self_del_profiles on public.profiles for delete to authenticated using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Notifications : visibles par leur destinataire (+ admin/manager)
-- ---------------------------------------------------------------------------
drop policy if exists read_notifications on public.notifications;
create policy read_notifications on public.notifications
  for select to authenticated
  using (user_id = auth.uid() or public.auth_role() in ('admin','manager'));

create policy owner_write_notifications on public.notifications
  for insert to authenticated with check (user_id = auth.uid() or public.auth_role() in ('admin','manager'));

create policy owner_mut_notifications on public.notifications
  for update to authenticated
  using (user_id = auth.uid() or public.auth_role() in ('admin','manager'))
  with check (user_id = auth.uid() or public.auth_role() in ('admin','manager'));

create policy owner_del_notifications on public.notifications
  for delete to authenticated
  using (user_id = auth.uid() or public.auth_role() in ('admin','manager'));
