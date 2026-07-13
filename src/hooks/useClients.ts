/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { Client } from '../types';
import { toClient, fromClient, ClientInsert } from '../lib/mappers';

export interface UseClientsResult {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createClient: (data: Omit<Client, 'id' | 'joinedAt'>) => Promise<Client | null>;
  updateClient: (client: Client) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<void>;
}

export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('clients')
      .select('*')
      .order('joined_at', { ascending: false });

    if (err) {
      setError(err.message);
      return;
    }
    setClients((data ?? []).map(toClient));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from('clients')
        .select('*')
        .order('joined_at', { ascending: false });

      if (!active) return;
      if (err) {
        setError(err.message);
      } else {
        setClients((data ?? []).map(toClient));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const createClient = useCallback(async (data: Omit<Client, 'id' | 'joinedAt'>) => {
    const insert: ClientInsert = { ...fromClient(data), created_by: userId };
    const { data: created, error: err } = await supabase
      .from('clients')
      .insert(insert)
      .select('*')
      .single();

    if (err) {
      setError(err.message);
      return null;
    }
    const client = toClient(created as any);
    setClients((prev) => [client, ...prev]);
    return client;
  }, [userId]);

  const updateClient = useCallback(async (client: Client) => {
    const { id, joinedAt, ...rest } = client;
    const { data: updated, error: err } = await supabase
      .from('clients')
      .update({ ...fromClient(rest) })
      .eq('id', id)
      .select('*')
      .single();

    if (err) {
      setError(err.message);
      return null;
    }
    const updatedClient = toClient(updated as any);
    setClients((prev) => prev.map((c) => (c.id === id ? updatedClient : c)));
    return updatedClient;
  }, []);

  const deleteClient = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('clients').delete().eq('id', id);
    if (err) {
      setError(err.message);
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { clients, loading, error, refresh, createClient, updateClient, deleteClient };
}
