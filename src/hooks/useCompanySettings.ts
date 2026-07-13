/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CompanySettings } from '../types';
import {
  toCompanySettings,
  fromCompanySettings,
  CompanySettingsInsert,
  CompanySettingsRow
} from '../lib/mappers';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'Votre Entreprise',
  email: '',
  phone: '',
  address: '',
  website: '',
  siret: '',
  vatNumber: '',
  currency: 'EUR (€)',
  primaryColor: '#3B82F6'
};

export interface UseCompanySettingsResult {
  settings: CompanySettings;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: CompanySettings) => Promise<void>;
}

export function useCompanySettings(): UseCompanySettingsResult {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!active) return;
      if (err) {
        setError(err.message);
      } else if (data) {
        setSettings(toCompanySettings(data as CompanySettingsRow));
        setSettingsId((data as CompanySettingsRow).id);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const updateSettings = useCallback(
    async (next: CompanySettings) => {
      // Always apply locally first (optimistic update) so the user sees changes immediately
      setSettings(next);

      const insert: CompanySettingsInsert = fromCompanySettings(next);
      if (settingsId) {
        const { error: err } = await supabase
          .from('company_settings')
          .update(insert)
          .eq('id', settingsId);
        if (err) {
          console.error('[CRM] Erreur maj company_settings:', err.message);
          setError(err.message);
          return;
        }
      } else {
        const { data, error: err } = await supabase
          .from('company_settings')
          .insert(insert)
          .select('*')
          .single();
        if (err) {
          console.error('[CRM] Erreur insert company_settings:', err.message);
          setError(err.message);
          return;
        }
        setSettingsId((data as CompanySettingsRow).id);
      }
    },
    [settingsId]
  );

  return { settings, loading, error, updateSettings };
}
