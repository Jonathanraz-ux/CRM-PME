import { createContext, useContext, ReactNode } from 'react';

interface DemoContextValue {
  demoMode: boolean;
}

const DemoContext = createContext<DemoContextValue>({ demoMode: false });

export function DemoProvider({ children }: { children: ReactNode }) {
  return (
    <DemoContext.Provider value={{ demoMode: true }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  return useContext(DemoContext);
}
