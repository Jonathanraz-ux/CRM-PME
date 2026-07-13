-- ============================================================================
-- 0006_seed.sql
-- Données de référence (référentiel), PAS de données métier fictives.
-- Les vrais leads/clients/devis seront saisis par les utilisateurs.
-- ============================================================================

-- Étapes du pipeline de vente (cohérent avec LeadStatus)
insert into public.pipeline_stages (key, label, position) values
  ('NEW',          'Nouveau',     1),
  ('CONTACTED',    'Contacté',    2),
  ('QUALIFIED',    'Qualifié',    3),
  ('PROPOSAL',     'Proposition', 4),
  ('NEGOTIATION',  'Négociation', 5),
  ('WON',          'Gagné',       6),
  ('LOST',         'Perdu',       7)
on conflict (key) do nothing;

-- Paramètres de l'entreprise émettrice (ligne unique par défaut)
insert into public.company_settings (name, currency, primary_color)
select 'Votre Entreprise', 'EUR (€)', '#3B82F6'
where not exists (select 1 from public.company_settings);
