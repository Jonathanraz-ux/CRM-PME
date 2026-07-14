/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus,
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  MoreVertical,
  DollarSign,
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  X,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Lead, LeadStatus, Activity } from '../types';
import { useUiPrefs } from '../hooks/useUiPrefs';

interface LeadsViewProps {
  leads: Lead[];
  activities: Activity[];
  onAddLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  openAddModalInitially?: boolean;
  onCloseInitialAddModal?: () => void;
  demoMode?: boolean;
}

export default function LeadsView({
  leads,
  activities,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  openAddModalInitially = false,
  onCloseInitialAddModal,
  demoMode = false
}: LeadsViewProps) {
  // Filters & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [valueFilter, setValueFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(openAddModalInitially);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  // Selected lead context
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formValue, setFormValue] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<LeadStatus>('NEW');
  const [formSource, setFormSource] = useState('Site Web');
  const [formAssignedTo, setFormAssignedTo] = useState('Thomas Dubois');
  const [formNotes, setFormNotes] = useState('');

  // Sync initial modal state
  React.useEffect(() => {
    if (openAddModalInitially) {
      setIsAddModalOpen(true);
      resetForm();
    }
  }, [openAddModalInitially]);

  const resetForm = () => {
    setFormName('');
    setFormCompany('');
    setFormEmail('');
    setFormPhone('');
    setFormValue(0);
    setFormStatus('NEW');
    setFormSource('Site Web');
    setFormAssignedTo('Thomas Dubois');
    setFormNotes('');
  };

  const loadFormForEdit = (lead: Lead) => {
    setFormName(lead.name);
    setFormCompany(lead.company);
    setFormEmail(lead.email);
    setFormPhone(lead.phone);
    setFormValue(lead.value);
    setFormStatus(lead.status);
    setFormSource(lead.source);
    setFormAssignedTo(lead.assignedTo);
    setFormNotes(lead.notes);
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLead({
      name: formName,
      company: formCompany,
      email: formEmail,
      phone: formPhone,
      value: Number(formValue),
      status: formStatus,
      source: formSource,
      assignedTo: formAssignedTo,
      notes: formNotes
    });
    setIsAddModalOpen(false);
    resetForm();
    if (onCloseInitialAddModal) onCloseInitialAddModal();
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    onUpdateLead({
      ...selectedLead,
      name: formName,
      company: formCompany,
      email: formEmail,
      phone: formPhone,
      value: Number(formValue),
      status: formStatus,
      source: formSource,
      assignedTo: formAssignedTo,
      notes: formNotes
    });
    setIsEditModalOpen(false);
    setSelectedLead(null);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = () => {
    if (!selectedLead) return;
    onDeleteLead(selectedLead.id);
    setIsDeleteModalOpen(false);
    setSelectedLead(null);
  };

  // ---- FILTERING LOGIC ----
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Search Query
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.notes.toLowerCase().includes(query);

      // 2. Status Filter
      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

      // 3. Value Filter
      let matchesValue = true;
      if (valueFilter === 'LOW') matchesValue = lead.value < 10000;
      else if (valueFilter === 'MID') matchesValue = lead.value >= 10000 && lead.value <= 25000;
      else if (valueFilter === 'HIGH') matchesValue = lead.value > 25000;

      return matchesSearch && matchesStatus && matchesValue;
    });
  }, [leads, searchTerm, statusFilter, valueFilter]);

  // ---- PAGINATION LOGIC ----
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // ---- GRAPHICS / STYLING BADGES ----
  const getStatusBadge = (status: LeadStatus) => {
    const badges: Record<LeadStatus, { label: string; bg: string }> = {
      'NEW': { label: 'Nouveau', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-300' },
      'CONTACTED': { label: 'Contacté', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' },
      'QUALIFIED': { label: 'Qualifié', bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' },
      'PROPOSAL': { label: 'Proposition', bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400' },
      'NEGOTIATION': { label: 'Négociation', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
      'WON': { label: 'Gagné', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
      'LOST': { label: 'Perdu', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' }
    };
    const badge = badges[status] || { label: status, bg: 'bg-gray-100 text-gray-800', border: 'border-gray-200' };
    
  return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
        {badge.label}
      </span>
    );
  };

  function formatEuro(value: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }

  const { view } = useUiPrefs();

  // Lead Activities
  const selectedLeadActivities = useMemo(() => {
    if (!selectedLead) return [];
    return activities
      .filter((a) => a.leadId === selectedLead.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activities, selectedLead]);

  const leadCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredLeads.map((lead) => (
        <div key={lead.id} className="crm-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{lead.name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                <Building className="w-3 h-3 shrink-0" />
                {lead.company}
              </p>
            </div>
            {getStatusBadge(lead.status)}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono font-semibold text-gray-950 dark:text-slate-100">{formatEuro(lead.value)}</span>
            <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-slate-800 rounded px-1.5 py-0.5">{lead.source}</span>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <User className="w-3 h-3 text-blue-500/70" />
            {lead.assignedTo}
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-slate-800/60">
            <button
              onClick={() => { setSelectedLead(lead); setIsDetailsDrawerOpen(true); }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setSelectedLead(lead); loadFormForEdit(lead); setIsEditModalOpen(true); }}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:text-blue-400 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setSelectedLead(lead); setIsDeleteModalOpen(true); }}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      {filteredLeads.length === 0 && (
        <p className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
          Aucun lead ne correspond aux critères de recherche.
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Leads & Opportunités</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Suivi des dossiers et progression du tunnel de vente
          </p>
        </div>
        <div>
          <button
            id="leads-add-lead-btn"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouveau Lead
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative md:col-span-2 flex items-center rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
          <Search className="w-4.5 h-4.5 ml-3 text-gray-400 shrink-0" />
          <input
            id="leads-search-input"
            type="text"
            placeholder="Rechercher par nom, entreprise..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            id="leads-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/40 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="NEW">Nouveau</option>
            <option value="CONTACTED">Contacté</option>
            <option value="QUALIFIED">Qualifié</option>
            <option value="PROPOSAL">Proposition</option>
            <option value="NEGOTIATION">Négociation</option>
            <option value="WON">Gagné</option>
            <option value="LOST">Perdu</option>
          </select>
        </div>

        {/* Value Filter */}
        <div className="relative">
          <select
            id="leads-value-filter"
            value={valueFilter}
            onChange={(e) => {
              setValueFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/40 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
          >
            <option value="ALL">Toutes les valeurs</option>
            <option value="LOW">Moins de 10k €</option>
            <option value="MID">10k € à 25k €</option>
            <option value="HIGH">Plus de 25k €</option>
          </select>
        </div>
      </div>

      {/* Leads Table Container */}
      {view === 'card' ? (
        leadCards
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-800/20 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <th className="py-4 px-6">Prospect / Entreprise</th>
                  <th className="py-4 px-6">Valeur</th>
                  <th className="py-4 px-6">Source / Assigné</th>
                  <th className="py-4 px-6 text-center">Statut</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/40 text-sm">
                {paginatedLeads.length > 0 ? (
                  paginatedLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors"
                    >
                      {/* Name & Company */}
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white block hover:text-blue-600 cursor-pointer" onClick={() => {
                            setSelectedLead(lead);
                            setIsDetailsDrawerOpen(true);
                          }}>
                            {lead.name}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <Building className="w-3 h-3" />
                            {lead.company}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-4 px-6">
                        <div className="font-mono font-semibold text-gray-950 dark:text-slate-100">
                          {formatEuro(lead.value)}
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Potentiel</span>
                      </td>

                      {/* Source & Owner */}
                      <td className="py-4 px-6">
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                          <span className="inline-block px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-[10px] font-semibold mb-1">
                            {lead.source}
                          </span>
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <User className="w-3 h-3 text-blue-500/70" />
                            <span>{lead.assignedTo}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(lead.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Voir les détails"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsDetailsDrawerOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Modifier"
                            onClick={() => {
                              setSelectedLead(lead);
                              loadFormForEdit(lead);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:text-blue-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Supprimer"
                            onClick={() => {
                              setSelectedLead(lead);
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
                      Aucun lead ne correspond aux critères de recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/20 dark:bg-slate-900/40">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong> ({filteredLeads.length} leads)
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

      {/* ---- ADD LEAD MODAL ---- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => {
            setIsAddModalOpen(false);
            if (onCloseInitialAddModal) onCloseInitialAddModal();
          }} />
          
          {/* Modal Panel */}
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white">Créer un Nouveau Prospect</h3>
              <button onClick={() => {
                setIsAddModalOpen(false);
                if (onCloseInitialAddModal) onCloseInitialAddModal();
              }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Sophie Martin"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Entreprise</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="TechFlow SAS"
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
                    placeholder="sophie@techflow.fr"
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
                    placeholder="06 12 34 56 78"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Valeur estimée (€)</label>
                  <input
                    type="number"
                    required
                    value={formValue || ''}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    placeholder="12000"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Statut Initial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="NEW">Nouveau</option>
                    <option value="CONTACTED">Contacté</option>
                    <option value="QUALIFIED">Qualifié</option>
                    <option value="PROPOSAL">Proposition</option>
                    <option value="NEGOTIATION">Négociation</option>
                    <option value="WON">Gagné</option>
                    <option value="LOST">Perdu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Site Web">Site Web</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Partenaire">Partenaire</option>
                    <option value="Recommandation">Recommandation</option>
                    <option value="Recherche Google">Recherche Google</option>
                    <option value="Salon Professionnel">Salon Professionnel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assigné à</label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Thomas Dubois">Thomas Dubois</option>
                    <option value="Julie Mercier">Julie Mercier</option>
                    <option value="Non assigné">Non assigné</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes / Commentaires</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Besoins exprimés, historique d'appel..."
                  rows={3}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    if (onCloseInitialAddModal) onCloseInitialAddModal();
                  }}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-md shadow-blue-500/10"
                >
                  Ajouter le Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- EDIT LEAD MODAL ---- */}
      {isEditModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
          
          {/* Modal Panel */}
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white">Modifier l'Opportunité</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Entreprise</label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
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
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Valeur estimée (€)</label>
                  <input
                    type="number"
                    required
                    value={formValue || ''}
                    onChange={(e) => setFormValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Statut</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="NEW">Nouveau</option>
                    <option value="CONTACTED">Contacté</option>
                    <option value="QUALIFIED">Qualifié</option>
                    <option value="PROPOSAL">Proposition</option>
                    <option value="NEGOTIATION">Négociation</option>
                    <option value="WON">Gagné</option>
                    <option value="LOST">Perdu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Source</label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Site Web">Site Web</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Partenaire">Partenaire</option>
                    <option value="Recommandation">Recommandation</option>
                    <option value="Recherche Google">Recherche Google</option>
                    <option value="Salon Professionnel">Salon Professionnel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assigné à</label>
                  <select
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Thomas Dubois">Thomas Dubois</option>
                    <option value="Julie Mercier">Julie Mercier</option>
                    <option value="Non assigné">Non assigné</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Notes / Commentaires</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none resize-none"
                />
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
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- DELETE MODAL ---- */}
      {isDeleteModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsDeleteModalOpen(false)} />
          
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">Confirmer la suppression</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Êtes-vous certain de vouloir supprimer le lead de <strong>{selectedLead.name} ({selectedLead.company})</strong> ?
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
                Supprimer le Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- DETAILS SLIDING DRAWER ---- */}
      {isDetailsDrawerOpen && selectedLead && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsDetailsDrawerOpen(false)} />

          {/* Drawer body */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Fiche Prospect</span>
                  <h3 className="text-lg font-bold text-gray-950 dark:text-white mt-0.5">{selectedLead.name}</h3>
                </div>
                <button 
                  onClick={() => setIsDetailsDrawerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Information Cards */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)]">
                {/* Visual Header Status card */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/60 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Statut Commercial</span>
                    <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">Valeur estimée</span>
                    <span className="text-base font-bold text-gray-950 dark:text-white font-mono mt-1 block">
                      {formatEuro(selectedLead.value)}
                    </span>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Informations de contact</h4>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-400 block">Entreprise</span>
                        <span className="font-semibold">{selectedLead.company}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-400 block">Email</span>
                        <span className="font-semibold hover:underline text-blue-600 cursor-pointer">{selectedLead.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-400 block">Téléphone</span>
                        <span>{selectedLead.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 text-sm bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-xl">
                  <div>
                    <span className="text-xs text-gray-400 block">Canal d'acquisition</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedLead.source}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block">Créé le</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {new Date(selectedLead.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-100 dark:border-slate-800/40">
                    <span className="text-xs text-gray-400 block">Commercial assigné</span>
                    <div className="flex items-center gap-1.5 mt-1 font-semibold text-gray-800 dark:text-gray-200">
                      <User className="w-4 h-4 text-blue-500" />
                      <span>{selectedLead.assignedTo}</span>
                    </div>
                  </div>
                </div>

                {/* Internal notes */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commentaire initial</h4>
                  <div className="p-3.5 bg-gray-50/50 dark:bg-slate-800/30 border border-gray-100 dark:border-slate-800/60 rounded-xl text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    "{selectedLead.notes || 'Aucune note disponible.'}"
                  </div>
                </div>

                {/* Visual timeline of actions on this specific lead */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Historique d'activité</h4>
                  
                  {selectedLeadActivities.length > 0 ? (
                    <div className="relative border-l-2 border-gray-100 dark:border-slate-800 pl-4 space-y-4 ml-1.5">
                      {selectedLeadActivities.map((act) => (
                        <div key={act.id} className="relative">
                          {/* dot */}
                          <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                          <div>
                            <span className="text-[9px] font-mono text-gray-400">
                              {new Date(act.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <h5 className="text-xs font-bold text-gray-900 dark:text-white">{act.title}</h5>
                            <p className="text-xs text-gray-500 mt-0.5">{act.description}</p>
                            <span className="text-[10px] text-gray-400">Par {act.user}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Aucune interaction commerciale enregistrée pour ce lead.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/60 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  loadFormForEdit(selectedLead);
                  setIsDetailsDrawerOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
              >
                <Edit2 className="w-4 h-4" />
                Modifier la fiche
              </button>
              <button
                onClick={() => setIsDetailsDrawerOpen(false)}
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
