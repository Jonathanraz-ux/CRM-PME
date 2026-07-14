/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Globe, 
  Phone, 
  Mail, 
  Building, 
  Calendar, 
  DollarSign,
  X,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Client, ClientStatus } from '../types';
import { useUiPrefs } from '../hooks/useUiPrefs';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'joinedAt'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  demoMode?: boolean;
}

export default function ClientsView({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  demoMode = false
}: ClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { view } = useUiPrefs();

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        client.companyName.toLowerCase().includes(query) ||
        client.contactName.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.industry.toLowerCase().includes(query);

      const matchesIndustry = industryFilter === 'ALL' || client.industry === industryFilter;

      return matchesSearch && matchesIndustry;
    });
  }, [clients, searchTerm, industryFilter]);

  const clientCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredClients.map((client) => (
        <div key={client.id} className="crm-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{client.companyName}</p>
              <p className="text-xs text-gray-400 truncate">{client.industry}</p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              client.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {client.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-800 dark:text-gray-200">{client.contactName}</div>
            <div className="text-xs text-gray-400 mt-0.5">{client.email}</div>
          </div>
          <div className="text-sm font-mono font-semibold text-gray-950 dark:text-slate-100">{formatEuro(client.totalBilled)}</div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-slate-800/60">
            <button
              onClick={() => { setSelectedClient(client); setIsDetailsOpen(true); }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
            >
              <Users className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setSelectedClient(client); loadFormForEdit(client); setIsEditModalOpen(true); }}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:text-blue-400 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setSelectedClient(client); setIsDeleteModalOpen(true); }}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {filteredClients.length === 0 && (
        <p className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
          Aucun compte client trouvé.
        </p>
      )}
    </div>
  );

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Selected client
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form states
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formBilled, setFormBilled] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<ClientStatus>('ACTIVE');

  const resetForm = () => {
    setFormCompany('');
    setFormContact('');
    setFormEmail('');
    setFormPhone('');
    setFormIndustry('Services');
    setFormWebsite('');
    setFormAddress('');
    setFormBilled(0);
    setFormStatus('ACTIVE');
  };

  const loadFormForEdit = (client: Client) => {
    setFormCompany(client.companyName);
    setFormContact(client.contactName);
    setFormEmail(client.email);
    setFormPhone(client.phone);
    setFormIndustry(client.industry);
    setFormWebsite(client.website);
    setFormAddress(client.address);
    setFormBilled(client.totalBilled);
    setFormStatus(client.status);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient({
      companyName: formCompany,
      contactName: formContact,
      email: formEmail,
      phone: formPhone,
      industry: formIndustry,
      website: formWebsite,
      address: formAddress,
      totalBilled: Number(formBilled),
      status: formStatus
    });
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    onUpdateClient({
      ...selectedClient,
      companyName: formCompany,
      contactName: formContact,
      email: formEmail,
      phone: formPhone,
      industry: formIndustry,
      website: formWebsite,
      address: formAddress,
      totalBilled: Number(formBilled),
      status: formStatus
    });
    setIsEditModalOpen(false);
    setSelectedClient(null);
  };

  const handleDeleteConfirm = () => {
    if (!selectedClient) return;
    onDeleteClient(selectedClient.id);
    setIsDeleteModalOpen(false);
    setSelectedClient(null);
  };

  // ---- FILTERING & SEARCH ----
  const industries = useMemo(() => {
    const list = new Set(clients.map(c => c.industry));
    return Array.from(list);
  }, [clients]);

  // ---- PAGINATION ---

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(start, start + itemsPerPage);
  }, [filteredClients, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  function formatEuro(value: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }

  // Stats Calculations
  const totalClientsCount = clients.length;
  const activeClientsCount = clients.filter(c => c.status === 'ACTIVE').length;
  const totalInvoiced = clients.reduce((sum, c) => sum + c.totalBilled, 0);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Portefeuille Clients</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion de vos comptes clients et historique de facturation
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouveau Client
          </button>
        </div>
      </div>

      {/* Client Stats widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md duration-150">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase">Total Comptes</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{totalClientsCount} PME clients</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md duration-150">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase">Comptes Actifs</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{activeClientsCount} comptes en service</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md duration-150">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase">Volume Facturé</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">{formatEuro(totalInvoiced)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative md:col-span-2 flex items-center rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
          <Search className="w-4.5 h-4.5 ml-3 text-gray-400 shrink-0" />
          <input
            id="clients-search-input"
            type="text"
            placeholder="Rechercher par raison sociale, nom du contact..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        <div>
          <select
            id="clients-industry-filter"
            value={industryFilter}
            onChange={(e) => {
              setIndustryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/40 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
          >
            <option value="ALL">Tous les secteurs d'activité</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Table */}
      {/* Clients Table Container */}
      {view === 'card' ? (
        clientCards
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-800/20 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="py-4 px-6">Entreprise / Secteur</th>
                <th className="py-4 px-6">Contact Principal</th>
                <th className="py-4 px-6">Total Facturé</th>
                <th className="py-4 px-6 text-center">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/40 text-sm">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    {/* Company info */}
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white block hover:text-blue-600 cursor-pointer" onClick={() => {
                          setSelectedClient(client);
                          setIsDetailsOpen(true);
                        }}>
                          {client.companyName}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">{client.industry}</span>
                      </div>
                    </td>

                    {/* Contact Person */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{client.contactName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{client.email}</div>
                    </td>

                    {/* Billing Amount */}
                    <td className="py-4 px-6 font-mono font-semibold text-gray-950 dark:text-slate-200">
                      {formatEuro(client.totalBilled)}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        client.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {client.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Voir les coordonnées"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsDetailsOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          title="Modifier"
                          onClick={() => {
                            setSelectedClient(client);
                            loadFormForEdit(client);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:text-blue-400 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          title="Supprimer"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucun compte client trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/20 dark:bg-slate-900/40">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong> ({filteredClients.length} clients)
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 dark:border-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
          
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white">Ajouter un Client</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Raison Sociale</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Decathlon SAS"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contact Principal</label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    placeholder="Marc Martin"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="contact@client.com"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="01 40 50 60 70"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Secteur d'Activité</label>
                  <input
                    type="text"
                    required
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    placeholder="Services, Industrie, Transport..."
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Site Internet</label>
                  <input
                    type="text"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    placeholder="www.client.com"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Adresse postale</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="12 rue des Fleurs, 75001 Paris"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Déjà facturé (€)</label>
                  <input
                    type="number"
                    value={formBilled || ''}
                    onChange={(e) => setFormBilled(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Statut Initial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ClientStatus)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="INACTIVE">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-md shadow-blue-500/10"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- EDIT CLIENT MODAL ---- */}
      {isEditModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
          
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white">Modifier la fiche Client</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Raison Sociale</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contact Principal</label>
                  <input
                    type="text"
                    required
                    value={formContact}
                    onChange={(e) => setFormContact(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Secteur</label>
                  <input
                    type="text"
                    required
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Site Internet</label>
                  <input
                    type="text"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Adresse</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Déjà facturé (€)</label>
                  <input
                    type="number"
                    value={formBilled || ''}
                    onChange={(e) => setFormBilled(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Statut</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ClientStatus)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="INACTIVE">Inactif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-md shadow-blue-500/10"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- DELETE CONFIRMATION MODAL ---- */}
      {isDeleteModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsDeleteModalOpen(false)} />
          
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">Supprimer le Client</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Êtes-vous sûr de vouloir supprimer le compte client <strong>{selectedClient.companyName}</strong> ?
              Cette action est irréversible.
            </p>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl transition-colors"
              >
                Supprimer le Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- CLIENT DETAILS SLIDING DRAWER ---- */}
      {isDetailsOpen && selectedClient && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsDetailsOpen(false)} />
          
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Fiche Client Entreprise</span>
                  <h3 className="text-lg font-bold text-gray-950 dark:text-white mt-0.5">{selectedClient.companyName}</h3>
                </div>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)]">
                {/* Billing summary badge */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/60 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Volume Facturé</span>
                    <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {formatEuro(selectedClient.totalBilled)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Statut Compte</span>
                    <div className="mt-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        selectedClient.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedClient.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Company details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coordonnées Entreprise</h4>
                  <div className="space-y-3.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                      <div>
                        <span className="text-xs text-gray-400 block">Adresse de facturation</span>
                        <span>{selectedClient.address}</span>
                      </div>
                    </div>
                    {selectedClient.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                        <div>
                          <span className="text-xs text-gray-400 block">Site Web</span>
                          <a 
                            href={`https://${selectedClient.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline text-blue-600 dark:text-blue-400 font-semibold"
                          >
                            {selectedClient.website}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                      <div>
                        <span className="text-xs text-gray-400 block">Client depuis le</span>
                        <span>{new Date(selectedClient.joinedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Principal</h4>
                  <div className="space-y-3.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <span className="text-xs text-gray-400 block">Nom complet</span>
                      <span className="font-semibold">{selectedClient.contactName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-400 block">Adresse de messagerie</span>
                        <span className="font-semibold text-blue-600 cursor-pointer">{selectedClient.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-400 block">Téléphone direct</span>
                        <span>{selectedClient.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/60 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  loadFormForEdit(selectedClient);
                  setIsDetailsOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
              >
                <Edit2 className="w-4 h-4" />
                Modifier la fiche
              </button>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
