/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { Lead } from '../types';
import { toLead, fromLead, LeadInsert } from '../lib/mappers';

export interface UseLeadsResult {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createLead: (data: Omit<Lead, 'id' | 'createdAt'>) => Promise<Lead | null>;
  updateLead: (lead: Lead) => Promise<Lead | null>;
  deleteLead: (id: string) => Promise<void>;
}

export function useLeads(): UseLeadsResult {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      return;
    }
    setLeads((data ?? []).map(toLead));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;
      if (err) {
        setError(err.message);
      } else {
        setLeads((data ?? []).map(toLead));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const createLead = useCallback(async (data: Omit<Lead, 'id' | 'createdAt'>) => {
    const insert: LeadInsert = { ...fromLead(data), created_by: userId };
    const { data: created, error: err } = await supabase
      .from('leads')
      .insert(insert)
      .select('*')
      .single();

    if (err) {
      setError(err.message);
      return null;
    }
    const lead = toLead(created as any);
    setLeads((prev) => [lead, ...prev]);
    return lead;
  }, [userId]);

  const updateLead = useCallback(async (lead: Lead) => {
    const { id, createdAt, ...rest } = lead;
    const { data: updated, error: err } = await supabase
      .from('leads')
      .update({ ...fromLead(rest) })
      .eq('id', id)
      .select('*')
      .single();

    if (err) {
      setError(err.message);
      return null;
    }
    const updatedLead = toLead(updated as any);
    setLeads((prev) => prev.map((l) => (l.id === id ? updatedLead : l)));
    return updatedLead;
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('leads').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return { leads, loading, error, refresh, createLead, updateLead, deleteLead };
}
