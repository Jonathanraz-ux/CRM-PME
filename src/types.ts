/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  status: LeadStatus;
  source: string;
  assignedTo: string;
  createdAt: string;
  notes: string;
}

export type ClientStatus = 'ACTIVE' | 'INACTIVE';

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  website: string;
  address: string;
  totalBilled: number;
  status: ClientStatus;
  joinedAt: string;
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  companyName: string;
  contactName: string;
  title: string;
  items: QuoteItem[];
  taxRate: number; // e.g. 20 for 20%
  status: QuoteStatus;
  sentAt: string;
  validUntil: string;
  notes?: string;
}

export type ActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'STATUS_CHANGE' | 'NOTE' | 'QUOTE_SENT';

export interface Activity {
  id: string;
  leadId?: string;
  type: ActivityType;
  title: string;
  description: string;
  date: string;
  user: string;
}

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  siret: string;
  vatNumber: string;
  currency: string;
  primaryColor: string;
}
