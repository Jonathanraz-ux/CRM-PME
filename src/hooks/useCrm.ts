/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useLeads } from './useLeads';
import { useClients } from './useClients';
import { useQuotes } from './useQuotes';
import { useActivities } from './useActivities';
import { useCompanySettings } from './useCompanySettings';
import { Lead, Client, Quote, Activity, CompanySettings } from '../types';

export interface UseCrmResult {
  leads: Lead[];
  clients: Client[];
  quotes: Quote[];
  activities: Activity[];
  settings: CompanySettings;
  loading: boolean;
  error: string | null;
  currentUser: string;

  addLead: (data: Omit<Lead, 'id' | 'createdAt'>) => Promise<Lead | null>;
  updateLead: (lead: Lead) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  addClient: (data: Omit<Client, 'id' | 'joinedAt'>) => Promise<Client | null>;
  updateClient: (client: Client) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<void>;

  addQuote: (data: Omit<Quote, 'id' | 'quoteNumber' | 'sentAt'>) => Promise<Quote | null>;
  updateQuote: (quote: Quote) => Promise<Quote | null>;
  deleteQuote: (id: string) => Promise<void>;

  updateSettings: (settings: CompanySettings) => Promise<void>;

  refreshAll: () => Promise<void>;
}

export function useCrm(): UseCrmResult {
  const { user, profile } = useAuth();
  const userId = user?.id ?? null;
  const currentUser = profile?.full_name || user?.email || 'Utilisateur';

  const leadsApi = useLeads();
  const clientsApi = useClients();
  const quotesApi = useQuotes();
  const activitiesApi = useActivities(userId);
  const settingsApi = useCompanySettings();

  const loading =
    leadsApi.loading ||
    clientsApi.loading ||
    quotesApi.loading ||
    activitiesApi.loading ||
    settingsApi.loading;
  const error =
    leadsApi.error ||
    clientsApi.error ||
    quotesApi.error ||
    activitiesApi.error ||
    settingsApi.error;

  // ---- Leads ----
  const addLead = useCallback(
    async (data: Omit<Lead, 'id' | 'createdAt'>) => {
      const created = await leadsApi.createLead(data);
      if (!created) return null;

      await activitiesApi.createActivity({
        leadId: created.id,
        type: 'STATUS_CHANGE',
        title: 'Prospect Ajouté',
        description: `Création du dossier commercial pour ${created.name} (${created.company}) avec un potentiel de ${created.value}€.`,
        date: new Date().toISOString(),
        user: currentUser
      });
      return created;
    },
    [leadsApi, activitiesApi, currentUser]
  );

  const updateLead = useCallback(
    async (lead: Lead) => {
      const oldLead = leadsApi.leads.find((l) => l.id === lead.id);
      const statusChanged = oldLead && oldLead.status !== lead.status;

      await leadsApi.updateLead(lead);
      if (!statusChanged || !oldLead) return;

      await activitiesApi.createActivity({
        leadId: lead.id,
        type: 'STATUS_CHANGE',
        title: 'Changement d\'étape',
        description: `Le prospect ${lead.name} est passé de l'étape "${oldLead.status}" à "${lead.status}".`,
        date: new Date().toISOString(),
        user: currentUser
      });

      if (lead.status === 'WON') {
        const clientExists = clientsApi.clients.some(
          (c) => c.companyName.toLowerCase() === lead.company.toLowerCase()
        );
        if (!clientExists) {
          const autoClient = await clientsApi.createClient({
            companyName: lead.company,
            contactName: lead.name,
            email: lead.email,
            phone: lead.phone,
            industry: 'Services du Numérique',
            website: lead.email.split('@')[1]
              ? `www.${lead.email.split('@')[1]}`
              : 'www.client-site.fr',
            address: 'Adresse de facturation à renseigner',
            totalBilled: lead.value,
            status: 'ACTIVE'
          });

          if (autoClient) {
            await activitiesApi.createActivity({
              type: 'STATUS_CHANGE',
              title: 'Nouveau Compte Client Créé',
              description: `Le prospect ${lead.company} a été converti en Client Actif suite à l'opportunité Gagnée.`,
              date: new Date().toISOString(),
              user: 'Système CRM'
            });
          }
        }
      }
    },
    [leadsApi, clientsApi, activitiesApi, currentUser]
  );

  const deleteLead = useCallback(
    async (id: string) => {
      const lead = leadsApi.leads.find((l) => l.id === id);
      await leadsApi.deleteLead(id);
      if (lead) {
        await activitiesApi.createActivity({
          type: 'NOTE',
          title: 'Prospect Supprimé',
          description: `Le dossier commercial de ${lead.name} (${lead.company}) a été archivé/supprimé par ${currentUser}.`,
          date: new Date().toISOString(),
          user: currentUser
        });
      }
    },
    [leadsApi, activitiesApi, currentUser]
  );

  // ---- Clients ----
  const addClient = useCallback(
    async (data: Omit<Client, 'id' | 'joinedAt'>) => {
      const created = await clientsApi.createClient(data);
      if (!created) return null;
      await activitiesApi.createActivity({
        type: 'STATUS_CHANGE',
        title: 'Nouveau Client Manuel',
        description: `Création du compte client entreprise pour ${created.companyName}.`,
        date: new Date().toISOString(),
        user: currentUser
      });
      return created;
    },
    [clientsApi, activitiesApi, currentUser]
  );

  const updateClient = useCallback(
    (client: Client) => clientsApi.updateClient(client),
    [clientsApi]
  );

  const deleteClient = useCallback(
    (id: string) => clientsApi.deleteClient(id),
    [clientsApi]
  );

  // ---- Quotes ----
  const addQuote = useCallback(
    async (data: Omit<Quote, 'id' | 'quoteNumber' | 'sentAt'>) => {
      const created = await quotesApi.createQuote(data);
      if (!created) return null;
      await activitiesApi.createActivity({
        type: 'QUOTE_SENT',
        title: 'Devis Émis',
        description: `Génération du devis commercial ${created.quoteNumber} pour ${created.companyName} d'une valeur estimée.`,
        date: new Date().toISOString(),
        user: currentUser
      });
      return created;
    },
    [quotesApi, activitiesApi, currentUser]
  );

  const updateQuote = useCallback(
    (quote: Quote) => quotesApi.updateQuote(quote),
    [quotesApi]
  );

  const deleteQuote = useCallback(
    (id: string) => quotesApi.deleteQuote(id),
    [quotesApi]
  );

  // ---- Settings ----
  const updateSettings = useCallback(
    (next: CompanySettings) => settingsApi.updateSettings(next),
    [settingsApi]
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([
      leadsApi.refresh(),
      clientsApi.refresh(),
      quotesApi.refresh(),
      activitiesApi.refresh()
    ]);
  }, [leadsApi, clientsApi, quotesApi, activitiesApi]);

  return useMemo(
    () => ({
      leads: leadsApi.leads,
      clients: clientsApi.clients,
      quotes: quotesApi.quotes,
      activities: activitiesApi.activities,
      settings: settingsApi.settings,
      loading,
      error,
      currentUser,
      addLead,
      updateLead,
      deleteLead,
      addClient,
      updateClient,
      deleteClient,
      addQuote,
      updateQuote,
      deleteQuote,
      updateSettings,
      refreshAll
    }),
    [
      leadsApi.leads,
      clientsApi.clients,
      quotesApi.quotes,
      activitiesApi.activities,
      settingsApi.settings,
      loading,
      error,
      currentUser,
      addLead,
      updateLead,
      deleteLead,
      addClient,
      updateClient,
      deleteClient,
      addQuote,
      updateQuote,
      deleteQuote,
      updateSettings,
      refreshAll
    ]
  );
}
