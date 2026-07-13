-- ============================================================================
-- 0003_modules_tables.sql
-- Tables des modules demandés mais absents de l'UI actuelle :
-- contacts, produits/services, tâches, rendez-vous, notes, notifications,
-- factures / paiements.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- contacts : personnes rattachées à un client
-- ---------------------------------------------------------------------------
create table if not exists public.contacts (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references public.clients (id) on delete cascade,
  full_name  text,
  email      text,
  phone      text,
  position   text,
  created_at timestamptz not null default now()
);

comment on table public.contacts is 'Contacts liés à un compte client.';

-- ---------------------------------------------------------------------------
-- product_categories + products + services : catalogue
-- ---------------------------------------------------------------------------
create table if not exists public.product_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories (id) on delete set null,
  name        text not null,
  description text,
  price       numeric(12,2) not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  rate        numeric(12,2) not null default 0,
  unit        text default 'heure',
  created_at  timestamptz not null default now()
);

comment on table public.products is 'Produits du catalogue.';
comment on table public.services is 'Services du catalogue.';

-- ---------------------------------------------------------------------------
-- tasks : tâches (assignation, statut, échéances)
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  assigned_to uuid references public.profiles (id) on delete set null,
  assigned_name text,
  due_date    timestamptz,
  status      text not null default 'TODO'
                check (status in ('TODO','IN_PROGRESS','DONE','CANCELLED')),
  priority    text default 'normal',
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

comment on table public.tasks is 'Tâches commerciales.';

-- ---------------------------------------------------------------------------
-- meetings : agenda / rendez-vous
-- ---------------------------------------------------------------------------
create table if not exists public.meetings (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  attendee_name text,
  client_id   uuid references public.clients (id) on delete set null,
  start_time  timestamptz not null,
  end_time    timestamptz,
  reminder_minutes int,
  notes       text,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

comment on table public.meetings is 'Rendez-vous et événements d''agenda.';

-- ---------------------------------------------------------------------------
-- notes : notes / messages / commentaires
-- ---------------------------------------------------------------------------
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id   uuid,
  body        text,
  author_id   uuid references public.profiles (id) on delete set null,
  author_name text,
  created_at  timestamptz not null default now()
);

comment on table public.notes is 'Notes et commentaires libres.';

-- ---------------------------------------------------------------------------
-- notifications : centre de notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete cascade,
  title      text,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.notifications is 'Notifications par utilisateur.';

-- ---------------------------------------------------------------------------
-- invoices + invoice_items + payments : facturation
-- ---------------------------------------------------------------------------
create table if not exists public.invoices (
  id         uuid primary key default gen_random_uuid(),
  quote_id   uuid references public.quotes (id) on delete set null,
  number     text,
  client_id  uuid references public.clients (id) on delete set null,
  status     text not null default 'PENDING'
              check (status in ('PENDING','PAID','OVERDUE','CANCELLED')),
  amount     numeric(12,2) not null default 0,
  issued_at  timestamptz not null default now(),
  due_date   date,
  created_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices (id) on delete cascade,
  description text,
  quantity    numeric(12,2) not null default 1,
  unit_price  numeric(12,2) not null default 0
);

create table if not exists public.payments (
  id         uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.invoices (id) on delete cascade,
  amount     numeric(12,2) not null default 0,
  method     text,
  paid_at    timestamptz not null default now()
);

comment on table public.invoices is 'Factures générées depuis les devis.';
