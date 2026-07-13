/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Lead,
  Client,
  Quote,
  QuoteItem,
  Activity,
  CompanySettings
} from '../types';

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export interface LeadRow {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  value: number | null;
  status: string;
  source: string | null;
  assigned_to: string | null;
  created_at: string;
  notes: string | null;
  created_by?: string | null;
}

export const toLead = (row: LeadRow): Lead => ({
  id: row.id,
  name: row.name,
  company: row.company ?? '',
  email: row.email ?? '',
  phone: row.phone ?? '',
  value: Number(row.value ?? 0),
  status: row.status as Lead['status'],
  source: row.source ?? '',
  assignedTo: row.assigned_to ?? '',
  createdAt: row.created_at,
  notes: row.notes ?? ''
});

export type LeadInsert = Omit<LeadRow, 'id' | 'created_at'> & { created_by?: string | null };

export const fromLead = (lead: Omit<Lead, 'id' | 'createdAt'>): LeadInsert => ({
  name: lead.name,
  company: lead.company,
  email: lead.email,
  phone: lead.phone,
  value: lead.value,
  status: lead.status,
  source: lead.source,
  assigned_to: lead.assignedTo,
  notes: lead.notes
});

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export interface ClientRow {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  website: string | null;
  address: string | null;
  total_billed: number | null;
  status: string;
  joined_at: string;
  created_by?: string | null;
  created_at?: string;
}

export const toClient = (row: ClientRow): Client => ({
  id: row.id,
  companyName: row.company_name,
  contactName: row.contact_name ?? '',
  email: row.email ?? '',
  phone: row.phone ?? '',
  industry: row.industry ?? '',
  website: row.website ?? '',
  address: row.address ?? '',
  totalBilled: Number(row.total_billed ?? 0),
  status: row.status as Client['status'],
  joinedAt: row.joined_at
});

export type ClientInsert = Omit<ClientRow, 'id' | 'joined_at' | 'created_at'> & {
  created_by?: string | null;
};

export const fromClient = (client: Omit<Client, 'id' | 'joinedAt'>): ClientInsert => ({
  company_name: client.companyName,
  contact_name: client.contactName,
  email: client.email,
  phone: client.phone,
  industry: client.industry,
  website: client.website,
  address: client.address,
  total_billed: client.totalBilled,
  status: client.status
});

// ---------------------------------------------------------------------------
// Quotes (+ quote_items)
// ---------------------------------------------------------------------------

export interface QuoteItemRow {
  id: string;
  description: string | null;
  quantity: number | null;
  unit_price: number | null;
  position?: number;
}

export const toQuoteItem = (row: QuoteItemRow): QuoteItem => ({
  id: row.id,
  description: row.description ?? '',
  quantity: Number(row.quantity ?? 0),
  unitPrice: Number(row.unit_price ?? 0)
});

export interface QuoteRow {
  id: string;
  quote_number: string;
  company_name: string | null;
  contact_name: string | null;
  title: string | null;
  tax_rate: number | null;
  status: string;
  sent_at: string | null;
  valid_until: string | null;
  notes: string | null;
  client_id?: string | null;
  created_by?: string | null;
  created_at?: string;
  quote_items?: QuoteItemRow[];
}

export const toQuote = (row: QuoteRow): Quote => ({
  id: row.id,
  quoteNumber: row.quote_number,
  companyName: row.company_name ?? '',
  contactName: row.contact_name ?? '',
  title: row.title ?? '',
  items: (row.quote_items ?? []).map(toQuoteItem),
  taxRate: Number(row.tax_rate ?? 0),
  status: row.status as Quote['status'],
  sentAt: row.sent_at ?? '',
  validUntil: row.valid_until ?? '',
  notes: row.notes ?? ''
});

export type QuoteInsert = {
  quote_number: string;
  company_name: string | null;
  contact_name: string | null;
  title: string | null;
  tax_rate: number;
  status: string;
  sent_at: string | null;
  valid_until: string | null;
  notes: string | null;
  items: { description: string; quantity: number; unit_price: number }[];
};

export const fromQuote = (
  quote: Omit<Quote, 'id' | 'quoteNumber' | 'sentAt'>,
  quoteNumber: string,
  sentAt: string
): QuoteInsert => ({
  quote_number: quoteNumber,
  company_name: quote.companyName,
  contact_name: quote.contactName,
  title: quote.title,
  tax_rate: quote.taxRate,
  status: quote.status,
  sent_at: sentAt || null,
  valid_until: quote.validUntil || null,
  notes: quote.notes ?? null,
  items: quote.items.map((i) => ({
    description: i.description,
    quantity: i.quantity,
    unit_price: i.unitPrice
  }))
});

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export interface ActivityRow {
  id: string;
  lead_id: string | null;
  type: string;
  title: string | null;
  description: string | null;
  date: string;
  user_id: string | null;
  user_name: string | null;
}

export const toActivity = (row: ActivityRow): Activity => ({
  id: row.id,
  leadId: row.lead_id ?? undefined,
  type: row.type as Activity['type'],
  title: row.title ?? '',
  description: row.description ?? '',
  date: row.date,
  user: row.user_name ?? 'Système'
});

export type ActivityInsert = {
  lead_id: string | null;
  type: string;
  title: string;
  description: string;
  user_name: string;
  user_id?: string | null;
};

export const fromActivity = (
  activity: Omit<Activity, 'id'>,
  userId?: string | null
): ActivityInsert => ({
  lead_id: activity.leadId ?? null,
  type: activity.type,
  title: activity.title,
  description: activity.description,
  user_name: activity.user,
  user_id: userId ?? null
});

// ---------------------------------------------------------------------------
// Company settings
// ---------------------------------------------------------------------------

export interface CompanySettingsRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  siret: string | null;
  vat_number: string | null;
  currency: string | null;
  primary_color: string | null;
}

export const toCompanySettings = (row: CompanySettingsRow): CompanySettings => ({
  name: row.name ?? '',
  email: row.email ?? '',
  phone: row.phone ?? '',
  address: row.address ?? '',
  website: row.website ?? '',
  siret: row.siret ?? '',
  vatNumber: row.vat_number ?? '',
  currency: row.currency ?? 'EUR (€)',
  primaryColor: row.primary_color ?? '#3B82F6'
});

export type CompanySettingsInsert = Omit<CompanySettingsRow, 'id'>;

export const fromCompanySettings = (settings: CompanySettings): CompanySettingsInsert => ({
  name: settings.name,
  email: settings.email,
  phone: settings.phone,
  address: settings.address,
  website: settings.website,
  siret: settings.siret,
  vat_number: settings.vatNumber,
  currency: settings.currency,
  primary_color: settings.primaryColor
});
