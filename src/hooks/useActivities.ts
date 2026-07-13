/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity } from '../types';
import { toActivity, fromActivity, ActivityInsert } from '../lib/mappers';

export interface UseActivitiesResult {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createActivity: (data: Omit<Activity, 'id'>) => Promise<Activity | null>;
}

export function useActivities(userId?: string | null): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: false });

    if (err) {
      setError(err.message);
      return;
    }
    setActivities((data ?? []).map(toActivity));
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: false });

      if (!active) return;
      if (err) {
        setError(err.message);
      } else {
        setActivities((data ?? []).map(toActivity));
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const createActivity = useCallback(
    async (data: Omit<Activity, 'id'>) => {
      const insert: ActivityInsert = fromActivity(data, userId);
      const { data: created, error: err } = await supabase
        .from('activities')
        .insert(insert)
        .select('*')
        .single();

      if (err) {
        setError(err.message);
        return null;
      }
      const activity = toActivity(created as any);
      setActivities((prev) => [activity, ...prev]);
      return activity;
    },
    [userId]
  );

  return { activities, loading, error, refresh, createActivity };
}
