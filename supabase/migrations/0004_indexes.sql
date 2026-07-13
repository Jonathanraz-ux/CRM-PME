-- ============================================================================
-- 0004_indexes.sql
-- Index pour les requêtes fréquentes (filtres, tris, jointures, KPI)
-- ============================================================================

-- leads
create index if not exists idx_leads_status      on public.leads (status);
create index if not exists idx_leads_created_at  on public.leads (created_at desc);
create index if not exists idx_leads_assigned_to on public.leads (assigned_to);
create index if not exists idx_leads_created_by  on public.leads (created_by);

-- clients
create index if not exists idx_clients_status      on public.clients (status);
create index if not exists idx_clients_company     on public.clients (company_name);
create index if not exists idx_clients_created_by  on public.clients (created_by);

-- quotes
create index if not exists idx_quotes_status      on public.quotes (status);
create index if not exists idx_quotes_number      on public.quotes (quote_number);
create index if not exists idx_quotes_client_id   on public.quotes (client_id);
create index if not exists idx_quotes_created_by  on public.quotes (created_by);

-- quote_items
create index if not exists idx_quote_items_quote_id on public.quote_items (quote_id);

-- activities
create index if not exists idx_activities_lead_id on public.activities (lead_id);
create index if not exists idx_activities_date    on public.activities (date desc);
create index if not exists idx_activities_user_id on public.activities (user_id);

-- tasks
create index if not exists idx_tasks_assigned_to on public.tasks (assigned_to);
create index if not exists idx_tasks_status      on public.tasks (status);
create index if not exists idx_tasks_due_date    on public.tasks (due_date);

-- meetings
create index if not exists idx_meetings_start_time on public.meetings (start_time);
create index if not exists idx_meetings_client_id  on public.meetings (client_id);

-- notes
create index if not exists idx_notes_entity on public.notes (entity_type, entity_id);

-- notifications
create index if not exists idx_notifications_user on public.notifications (user_id, read);

-- invoices
create index if not exists idx_invoices_status    on public.invoices (status);
create index if not exists idx_invoices_client_id on public.invoices (client_id);
create index if not exists idx_invoices_due_date  on public.invoices (due_date);
