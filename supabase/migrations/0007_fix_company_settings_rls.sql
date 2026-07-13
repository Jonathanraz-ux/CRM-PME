-- ============================================================================
-- 0007_fix_company_settings_rls.sql
-- Permet à tout utilisateur authentifié de modifier company_settings
-- (c'est une table singleton partagée, pas une table multi-tenant)
-- ============================================================================

-- Permettre à tout utilisateur authentifié de mettre à jour les paramètres
create policy authenticated_update_company_settings
  on public.company_settings
  for update
  to authenticated
  using (true)
  with check (true);

-- Permettre à tout utilisateur authentifié d'insérer (au cas où la ligne n'existe pas)
create policy authenticated_insert_company_settings
  on public.company_settings
  for insert
  to authenticated
  with check (true);
