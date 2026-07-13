-- ============================================================================
-- 0002_core_tables.sql
-- Tables cœur ( correspondent au localStorage actuel : leads, clients,
-- quotes, quote_items, activities, company_settings )
-- Conçues pour un mapping 1:1 avec les types TypeScript de l'application.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- clients : comptes clients (sert aussi de table "Entreprises / Comptes")
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id           uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email        text,
  phone        text,
  industry     text,
  website      text,
  address      text,
  total_billed numeric(12,2) not null default 0,
  status       text not null default 'ACTIVE'
                 check (status in ('ACTIVE', 'INACTIVE')),
  joined_at    timestamptz not null default now(),
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

comment on table public.clients is 'Comptes clients / entreprises.';

-- ---------------------------------------------------------------------------
-- pipeline_stages : étapes du tunnel de vente (remplace l'enum LeadStatus)
-- ---------------------------------------------------------------------------
create table if not exists public.pipeline_stages (
  id       uuid primary key default gen_random_uuid(),
  key      text unique not null,
  label    text not null,
  position int  not null
);

comment on table public.pipeline_stages is 'Étapes du pipeline (NEW -> WON/LOST).';

-- ---------------------------------------------------------------------------
-- leads : prospects / opportunités
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  company     text,
  email       text,
  phone       text,
  value       numeric(12,2) not null default 0,
  status      text not null default 'NEW'
                check (status in ('NEW','CONTACTED','QUALIFIED','PROPOSAL','NEGOTIATION','WON','LOST')),
  source      text,
  assigned_to text,
  created_at  timestamptz not null default now(),
  notes       text,
  created_by  uuid references public.profiles (id) on delete set null
);

comment on table public.leads is 'Prospects et opportunités commerciales.';

-- ---------------------------------------------------------------------------
-- quotes : devis
-- ---------------------------------------------------------------------------
create table if not exists public.quotes (
  id           uuid primary key default gen_random_uuid(),
  quote_number text not null,
  company_name text,
  contact_name text,
  title        text,
  tax_rate     numeric(5,2) not null default 20,
  status       text not null default 'DRAFT'
                 check (status in ('DRAFT','SENT','ACCEPTED','REJECTED','EXPIRED')),
  sent_at      timestamptz,
  valid_until  date,
  notes        text,
  client_id    uuid references public.clients (id) on delete set null,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

comment on table public.quotes is 'Devis commerciaux.';

-- ---------------------------------------------------------------------------
-- quote_items : lignes de devis
-- ---------------------------------------------------------------------------
create table if not exists public.quote_items (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid not null references public.quotes (id) on delete cascade,
  description text,
  quantity    numeric(12,2) not null default 1,
  unit_price  numeric(12,2) not null default 0,
  position    int not null default 0
);

comment on table public.quote_items is 'Lignes détail d''un devis.';

-- ---------------------------------------------------------------------------
-- activities : journal d'activité (fil d'actualité, notifications)
-- ---------------------------------------------------------------------------
create table if not exists public.activities (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references public.leads (id) on delete set null,
  type        text not null
                check (type in ('CALL','EMAIL','MEETING','STATUS_CHANGE','NOTE','QUOTE_SENT')),
  title       text,
  description text,
  date        timestamptz not null default now(),
  user_id     uuid references public.profiles (id) on delete set null,
  user_name   text
);

comment on table public.activities is 'Historique des interactions commerciales.';

-- ---------------------------------------------------------------------------
-- company_settings : paramètres de l'émetteur (ligne unique)
-- ---------------------------------------------------------------------------
create table if not exists public.company_settings (
  id           uuid primary key default gen_random_uuid(),
  name         text,
  email        text,
  phone        text,
  address      text,
  website      text,
  siret        text,
  vat_number   text,
  currency     text default 'EUR (€)',
  primary_color text default '#3B82F6'
);

comment on table public.company_settings is 'Identité légale de l''entreprise (une seule ligne).';
