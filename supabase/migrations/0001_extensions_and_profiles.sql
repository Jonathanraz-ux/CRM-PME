-- ============================================================================
-- 0001_extensions_and_profiles.sql
-- Extensions + table profiles (1:1 avec auth.users) + trigger à l'inscription
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles : complète auth.users avec le rôle et l'identité de l'utilisateur
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'employee'
                check (role in ('admin', 'manager', 'commercial', 'employee', 'readonly')),
  avatar_url  text,
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Profil utilisateur et rôle (RBAC).';

-- Fonction déclenchée à la création d'un compte auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    'employee'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
