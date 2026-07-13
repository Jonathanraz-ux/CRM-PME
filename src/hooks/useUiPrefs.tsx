/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';

export type ViewMode = 'table' | 'card';
export type Density = 'comfort' | 'compact';

interface UiPrefsValue {
  view: ViewMode;
  density: Density;
  setView: (v: ViewMode) => void;
  setDensity: (d: Density) => void;
}

const UiPrefsContext = createContext<UiPrefsValue | null>(null);

const read = (key: string, fallback: string) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

export function UiPrefsProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewMode>(() => read('crm_view_mode', 'table') as ViewMode);
  const [density, setDensity] = useState<Density>(() => read('crm_density', 'comfort') as Density);

  useEffect(() => {
    try {
      localStorage.setItem('crm_view_mode', view);
    } catch {
      /* ignore */
    }
  }, [view]);

  useEffect(() => {
    try {
      localStorage.setItem('crm_density', density);
    } catch {
      /* ignore */
    }
  }, [density]);

  return (
    <UiPrefsContext.Provider value={{ view, density, setView, setDensity }}>
      {children}
    </UiPrefsContext.Provider>
  );
}

export function useUiPrefs(): UiPrefsValue {
  const ctx = useContext(UiPrefsContext);
  if (!ctx) {
    throw new Error('useUiPrefs doit être utilisé dans un UiPrefsProvider');
  }
  return ctx;
}
