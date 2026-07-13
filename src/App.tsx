/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthProvider';
import LoginScreen from './auth/LoginScreen';
import { useCrm } from './hooks/useCrm';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import LeadsView from './components/LeadsView';
import ClientsView from './components/ClientsView';
import QuotesView from './components/QuotesView';
import SettingsView from './components/SettingsView';

import { Lead, Client, Quote } from './types';
import { useUiPrefs } from './hooks/useUiPrefs';
import { withAlpha, shade } from './lib/color';

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

function AppShell() {
  const { signOut, profile } = useAuth();
  const crm = useCrm();
  const { view, density } = useUiPrefs();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [openAddLeadInitially, setOpenAddLeadInitially] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(true);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('crm_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('crm_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Apply the primary brand color (from Settings) as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const base = crm.settings.primaryColor || '#3B82F6';
    root.style.setProperty('--crm-primary', base);
    root.style.setProperty('--crm-primary-hover', shade(base, 0.85));
    root.style.setProperty('--crm-primary-soft', withAlpha(base, 0.08));
    root.style.setProperty('--crm-primary-ring', withAlpha(base, 0.1));
  }, [crm.settings.primaryColor]);

  const handleTriggerAddLeadFlow = () => {
    setCurrentView('leads');
    setOpenAddLeadInitially(true);
  };

  const addLead = (data: Omit<Lead, 'id' | 'createdAt'>) => {
    crm.addLead(data);
  };
  const updateLead = (lead: Lead) => {
    crm.updateLead(lead);
  };
  const deleteLead = (id: string) => {
    crm.deleteLead(id);
  };
  const addClient = (data: Omit<Client, 'id' | 'joinedAt'>) => {
    crm.addClient(data);
  };
  const updateClient = (client: Client) => {
    crm.updateClient(client);
  };
  const deleteClient = (id: string) => {
    crm.deleteClient(id);
  };
  const addQuote = (data: Omit<Quote, 'id' | 'quoteNumber' | 'sentAt'>) => {
    crm.addQuote(data);
  };
  const updateQuote = (quote: Quote) => {
    crm.updateQuote(quote);
  };
  const deleteQuote = (id: string) => {
    crm.deleteQuote(id);
  };
  const updateSettings = (settings: typeof crm.settings) => {
    crm.updateSettings(settings);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            leads={crm.leads}
            clients={crm.clients}
            quotes={crm.quotes}
            activities={crm.activities}
            onNavigate={setCurrentView}
            onAddLead={handleTriggerAddLeadFlow}
          />
        );
      case 'leads':
        return (
          <LeadsView
            leads={crm.leads}
            activities={crm.activities}
            onAddLead={addLead}
            onUpdateLead={updateLead}
            onDeleteLead={deleteLead}
            openAddModalInitially={openAddLeadInitially}
            onCloseInitialAddModal={() => setOpenAddLeadInitially(false)}
          />
        );
      case 'clients':
        return (
          <ClientsView
            clients={crm.clients}
            onAddClient={addClient}
            onUpdateClient={updateClient}
            onDeleteClient={deleteClient}
          />
        );
      case 'quotes':
        return (
          <QuotesView
            quotes={crm.quotes}
            companyName={crm.settings.name}
            companyAddress={crm.settings.address}
            companySiret={crm.settings.siret}
            onAddQuote={addQuote}
            onUpdateQuote={updateQuote}
            onDeleteQuote={deleteQuote}
          />
        );
      case 'settings':
        return (
          <SettingsView settings={crm.settings} onUpdateSettings={updateSettings} />
        );
      default:
        return (
          <div className="py-12 text-center text-gray-500">Vue non implémentée</div>
        );
    }
  };

  if (crm.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chargement des données…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root-shell" className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-150" data-view={view} data-density={density}>
      {crm.error && showError && (
        <div className="fixed top-0 inset-x-0 z-50 bg-red-600 text-white text-sm px-4 py-2 flex items-center justify-between">
          <span>Erreur Supabase : {crm.error}</span>
          <button onClick={() => setShowError(false)} className="font-bold px-2">×</button>
        </div>
      )}

      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userName={crm.currentUser}
        userRole={profile?.role ? capitalize(profile.role) : 'Administrateur'}
      />

      <div className="flex flex-col lg:pl-64 min-h-screen">
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          companyName={crm.settings.name}
          activities={crm.activities}
          userName={crm.currentUser}
          userRole={profile?.role ? capitalize(profile.role) : 'Administrateur'}
          onSignOut={() => signOut()}
          leads={crm.leads}
          clients={crm.clients}
          quotes={crm.quotes}
          onNavigate={setCurrentView}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppShell />;
}
