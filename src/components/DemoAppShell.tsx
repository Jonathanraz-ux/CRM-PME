import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import DashboardView from './DashboardView';
import LeadsView from './LeadsView';
import ClientsView from './ClientsView';
import QuotesView from './QuotesView';
import SettingsView from './SettingsView';
import DemoBanner from './DemoBanner';
import { useDemoToast } from './DemoToast';
import { DemoProvider } from '../auth/DemoContext';
import {
  demoLeads,
  demoClients,
  demoQuotes,
  demoActivities,
  demoSettings,
} from '../data/demo-data';
import { Lead, Client, Quote } from '../types';
import { useUiPrefs } from '../hooks/useUiPrefs';
import { withAlpha, shade } from '../lib/color';

function DemoAppShellInner() {
  const navigate = useNavigate();
  const { view, density } = useUiPrefs();
  const { showToast } = useDemoToast();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [openAddLeadInitially, setOpenAddLeadInitially] = useState<boolean>(false);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('crm_dark_mode');
    return saved === 'true';
  });

  // Local demo state
  const [leads, setLeads] = useState<Lead[]>(demoLeads);
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [quotes, setQuotes] = useState<Quote[]>(demoQuotes);
  const [settings, setSettings] = useState(demoSettings);

  useEffect(() => {
    localStorage.setItem('crm_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const root = document.documentElement;
    const base = settings.primaryColor || '#3B82F6';
    root.style.setProperty('--crm-primary', base);
    root.style.setProperty('--crm-primary-hover', shade(base, 0.85));
    root.style.setProperty('--crm-primary-soft', withAlpha(base, 0.08));
    root.style.setProperty('--crm-primary-ring', withAlpha(base, 0.1));
  }, [settings.primaryColor]);

  const simulateAction = (action?: string) => {
    showToast(
      action ||
        'Action simulée avec succès. Aucune donnée réelle n\'a été modifiée.',
      'success'
    );
  };

  const handleTriggerAddLeadFlow = () => {
    setCurrentView('leads');
    setOpenAddLeadInitially(true);
  };

  // Demo CRUD wrappers — all simulated
  const addLead = (data: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...data,
      id: `demo-lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [...prev, newLead]);
    simulateAction('Lead ajouté avec succès. Aucune donnée réelle n\'a été modifiée.');
  };

  const updateLead = (lead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
    simulateAction('Lead mis à jour. Aucune donnée réelle n\'a été modifiée.');
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    simulateAction('Lead supprimé. Aucune donnée réelle n\'a été modifiée.');
  };

  const addClient = (data: Omit<Client, 'id' | 'joinedAt'>) => {
    const newClient: Client = {
      ...data,
      id: `demo-client-${Date.now()}`,
      joinedAt: new Date().toISOString(),
    };
    setClients((prev) => [...prev, newClient]);
    simulateAction('Client ajouté avec succès. Aucune donnée réelle n\'a été modifiée.');
  };

  const updateClient = (client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    simulateAction('Client mis à jour. Aucune donnée réelle n\'a été modifiée.');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    simulateAction('Client supprimé. Aucune donnée réelle n\'a été modifiée.');
  };

  const addQuote = (data: Omit<Quote, 'id' | 'quoteNumber' | 'sentAt'>) => {
    const newQuote: Quote = {
      ...data,
      id: `demo-quote-${Date.now()}`,
      quoteNumber: `DEV-2026-${String(quotes.length + 70).padStart(3, '0')}`,
      sentAt: new Date().toISOString(),
    };
    setQuotes((prev) => [...prev, newQuote]);
    simulateAction('Devis généré. Aucune donnée réelle n\'a été modifiée.');
  };

  const updateQuote = (quote: Quote) => {
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? quote : q)));
    simulateAction('Devis mis à jour. Aucune donnée réelle n\'a été modifiée.');
  };

  const deleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
    simulateAction('Devis supprimé. Aucune donnée réelle n\'a été modifiée.');
  };

  const updateSettings = (next: typeof settings) => {
    setSettings(next);
    simulateAction('Paramètres sauvegardés. Aucune donnée réelle n\'a été modifiée.');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            leads={leads}
            clients={clients}
            quotes={quotes}
            activities={demoActivities}
            onNavigate={setCurrentView}
            onAddLead={handleTriggerAddLeadFlow}
            demoMode
          />
        );
      case 'leads':
        return (
          <LeadsView
            leads={leads}
            activities={demoActivities}
            onAddLead={addLead}
            onUpdateLead={updateLead}
            onDeleteLead={deleteLead}
            openAddModalInitially={openAddLeadInitially}
            onCloseInitialAddModal={() => setOpenAddLeadInitially(false)}
            demoMode
          />
        );
      case 'clients':
        return (
          <ClientsView
            clients={clients}
            onAddClient={addClient}
            onUpdateClient={updateClient}
            onDeleteClient={deleteClient}
            demoMode
          />
        );
      case 'quotes':
        return (
          <QuotesView
            quotes={quotes}
            companyName={settings.name}
            companyAddress={settings.address}
            companySiret={settings.siret}
            onAddQuote={addQuote}
            onUpdateQuote={updateQuote}
            onDeleteQuote={deleteQuote}
            demoMode
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            onUpdateSettings={updateSettings}
            demoMode
          />
        );
      default:
        return (
          <div className="py-12 text-center text-gray-500">Vue non implémentée</div>
        );
    }
  };

  return (
    <DemoProvider>
      <div
        id="demo-root-shell"
        className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-150"
        data-view={view}
        data-density={density}
      >
        <DemoBanner companyName={settings.name} />

        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          userName="Visiteur Démo"
          userRole="Mode Démo"
        />

        <div className="flex flex-col lg:pl-64 min-h-screen">
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            companyName={settings.name}
            activities={demoActivities}
            userName="Visiteur Démo"
            userRole="Mode Démo"
            onSignOut={() => navigate('/')}
            leads={leads}
            clients={clients}
            quotes={quotes}
            onNavigate={setCurrentView}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </DemoProvider>
  );
}

export default function DemoAppShell() {
  return <DemoAppShellInner />;
}
