/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  DollarSign, 
  Send, 
  Check, 
  AlertCircle,
  FileCheck,
  Percent,
  Download,
  Building,
  ArrowRight
} from 'lucide-react';
import { Quote, QuoteItem, QuoteStatus } from '../types';
import { useUiPrefs } from '../hooks/useUiPrefs';

interface QuotesViewProps {
  quotes: Quote[];
  companyName: string;
  companyAddress: string;
  companySiret: string;
  onAddQuote: (quote: Omit<Quote, 'id' | 'quoteNumber' | 'sentAt'>) => void;
  onUpdateQuote: (quote: Quote) => void;
  onDeleteQuote: (id: string) => void;
}

export default function QuotesView({
  quotes,
  companyName,
  companyAddress,
  companySiret,
  onAddQuote,
  onUpdateQuote,
  onDeleteQuote
}: QuotesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { view } = useUiPrefs();

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch = 
        q.quoteNumber.toLowerCase().includes(query) ||
        q.companyName.toLowerCase().includes(query) ||
        q.title.toLowerCase().includes(query) ||
        q.contactName.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchTerm, statusFilter]);

  const quoteCards = (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {filteredQuotes.map((quote) => {
        const math = getQuoteMath(quote);
        return (
          <div key={quote.id} className="crm-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono font-semibold text-blue-600 dark:text-blue-400 truncate cursor-pointer" onClick={() => { setSelectedQuote(quote); setIsPreviewOpen(true); }}>
                  {quote.quoteNumber}
                </p>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-300 truncate mt-0.5">{quote.title}</p>
              </div>
              {getStatusBadge(quote.status)}
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{quote.companyName}</span>
              </div>
              <span className="text-xs text-gray-400 block mt-0.5 truncate">{quote.contactName}</span>
            </div>
            <div className="text-sm">
              <div className="font-mono font-bold text-gray-950 dark:text-slate-200">{formatEuro(math.ttc)}</div>
              <span className="text-[10px] text-gray-400 block mt-0.5">HT : {formatEuro(math.ht)}</span>
            </div>
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-slate-800/60">
              <button
                title="Aperçu professionnel PDF"
                onClick={() => { setSelectedQuote(quote); setIsPreviewOpen(true); }}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                title="Modifier"
                onClick={() => { setSelectedQuote(quote); loadFormForEdit(quote); setIsEditModalOpen(true); }}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:text-blue-400 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                title="Supprimer"
                onClick={() => { setSelectedQuote(quote); setIsDeleteModalOpen(true); }}
                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
      {filteredQuotes.length === 0 && (
        <p className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
          Aucune proposition commerciale trouvée.
        </p>
      )}
    </div>
  );

  // Focus Quote Context
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  // --- FORM STATE ---
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formTaxRate, setFormTaxRate] = useState<number>(20);
  const [formStatus, setFormStatus] = useState<QuoteStatus>('DRAFT');
  const [formValidUntil, setFormValidUntil] = useState('');
  const [formNotes, setFormNotes] = useState('');
  
  // Dynamic line items state for the editor
  const [formItems, setFormItems] = useState<Omit<QuoteItem, 'id'>[]>([
    { description: 'Prestation de service', quantity: 1, unitPrice: 1500 }
  ]);

  // Temp single item values in editor row
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

  const resetForm = () => {
    setFormCompanyName('');
    setFormContactName('');
    setFormTitle('');
    setFormTaxRate(20);
    setFormStatus('DRAFT');
    
    // Set validation date to 30 days from now
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setFormValidUntil(d.toISOString().substring(0, 10));
    setFormNotes('');
    setFormItems([
      { description: 'Licences logicielles cloud', quantity: 10, unitPrice: 120 },
      { description: 'Prestation de configuration sur-mesure', quantity: 1, unitPrice: 1500 }
    ]);
    
    // Clear adding-row temp values
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const loadFormForEdit = (q: Quote) => {
    setFormCompanyName(q.companyName);
    setFormContactName(q.contactName);
    setFormTitle(q.title);
    setFormTaxRate(q.taxRate);
    setFormStatus(q.status);
    setFormValidUntil(q.validUntil.substring(0, 10));
    setFormNotes(q.notes || '');
    setFormItems(q.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })));
  };

  // Add line item to editor list
  const handleAddLineItem = () => {
    if (!newItemDesc.trim()) return;
    setFormItems([
      ...formItems,
      {
        description: newItemDesc,
        quantity: Number(newItemQty) || 1,
        unitPrice: Number(newItemPrice) || 0
      }
    ]);
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  // Remove line item from editor list
  const handleRemoveLineItem = (index: number) => {
    setFormItems(formItems.filter((_, idx) => idx !== index));
  };

  // Calculate current form items total
  const formItemsTotal = useMemo(() => {
    return formItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [formItems]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0) {
      alert('Veuillez ajouter au moins un produit ou service au devis.');
      return;
    }
    
    const itemsWithIds = formItems.map((item, i) => ({
      ...item,
      id: `item-${Date.now()}-${i}`
    }));

    onAddQuote({
      companyName: formCompanyName,
      contactName: formContactName,
      title: formTitle,
      items: itemsWithIds,
      taxRate: Number(formTaxRate),
      status: formStatus,
      validUntil: formValidUntil,
      notes: formNotes
    });

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote) return;
    if (formItems.length === 0) {
      alert('Veuillez ajouter au moins un produit ou service au devis.');
      return;
    }

    const itemsWithIds = formItems.map((item, i) => ({
      ...item,
      id: `item-${Date.now()}-${i}`
    }));

    onUpdateQuote({
      ...selectedQuote,
      companyName: formCompanyName,
      contactName: formContactName,
      title: formTitle,
      items: itemsWithIds,
      taxRate: Number(formTaxRate),
      status: formStatus,
      validUntil: formValidUntil,
      notes: formNotes
    });

    setIsEditModalOpen(false);
    setSelectedQuote(null);
  };

  const handleDeleteConfirm = () => {
    if (!selectedQuote) return;
    onDeleteQuote(selectedQuote.id);
    setIsDeleteModalOpen(false);
    setSelectedQuote(null);
  };

  // ---- FILTER & SEARCH ----
  // ---- PAGINATION ---

  const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage) || 1;
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuotes.slice(start, start + itemsPerPage);
  }, [filteredQuotes, currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // ---- MATH HELPERS ----
  function getQuoteMath(quote: Quote) {
    const ht = quote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = ht * (quote.taxRate / 100);
    const ttc = ht + tax;
    return { ht, tax, ttc };
  }

  function formatEuro(value: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  }

  function formatEuroNoCents(value: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }

  function getStatusBadge(status: QuoteStatus) {
    const styles: Record<QuoteStatus, { label: string; bg: string }> = {
      'DRAFT': { label: 'Brouillon', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400' },
      'SENT': { label: 'Envoyé', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400' },
      'ACCEPTED': { label: 'Accepté', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' },
      'REJECTED': { label: 'Refusé', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' },
      'EXPIRED': { label: 'Expiré', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' }
    };
    const s = styles[status] || { label: status, bg: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
        {s.label}
      </span>
    );
  }

  // Summary widgets calculations
  const totalSentValue = quotes
    .filter(q => q.status === 'SENT')
    .reduce((sum, q) => sum + getQuoteMath(q).ttc, 0);

  const totalAcceptedValue = quotes
    .filter(q => q.status === 'ACCEPTED')
    .reduce((sum, q) => sum + getQuoteMath(q).ttc, 0);

  const draftCount = quotes.filter(q => q.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Gestion des Devis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Générez des propositions commerciales élégantes et suivez les signatures
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
            Créer un Devis
          </button>
        </div>
      </div>

      {/* Quote summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md duration-150">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase">Devis Envoyés</span>
            <span className="text-lg font-bold text-gray-950 dark:text-white font-mono">{formatEuroNoCents(totalSentValue)}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md duration-150">
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase">Devis Signés</span>
            <span className="text-lg font-bold text-gray-950 dark:text-white font-mono">{formatEuroNoCents(totalAcceptedValue)}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md duration-150">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold block uppercase">En Brouillon</span>
            <span className="text-lg font-bold text-gray-950 dark:text-white">{draftCount} propositions en cours</span>
          </div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative md:col-span-2 flex items-center rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
          <Search className="w-4.5 h-4.5 ml-3 text-gray-400 shrink-0" />
          <input
            id="quotes-search-input"
            type="text"
            placeholder="Rechercher par numéro, entreprise, objet..."
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
            id="quotes-status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/40 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
          >
            <option value="ALL">Tous les statuts de devis</option>
            <option value="DRAFT">Brouillon</option>
            <option value="SENT">Envoyé</option>
            <option value="ACCEPTED">Accepté</option>
            <option value="REJECTED">Refusé</option>
            <option value="EXPIRED">Expiré</option>
          </select>
        </div>
      </div>

      {/* Table list */}
      {/* Quotes Table Container */}
      {view === 'card' ? (
        quoteCards
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-800/20 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="py-4 px-6">Numéro / Projet</th>
                <th className="py-4 px-6">Compte Client</th>
                <th className="py-4 px-6">Montant TTC</th>
                <th className="py-4 px-6">Date de validité</th>
                <th className="py-4 px-6 text-center">Statut</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/40 text-sm">
              {paginatedQuotes.length > 0 ? (
                paginatedQuotes.map((quote) => {
                  const math = getQuoteMath(quote);
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      {/* Quote Number & Title */}
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 block cursor-pointer" onClick={() => {
                            setSelectedQuote(quote);
                            setIsPreviewOpen(true);
                          }}>
                            {quote.quoteNumber}
                          </span>
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-300 block mt-0.5">{quote.title}</span>
                        </div>
                      </td>

                      {/* Customer context */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          <span>{quote.companyName}</span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">{quote.contactName}</span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6">
                        <div className="font-mono font-bold text-gray-950 dark:text-slate-200">
                          {formatEuro(math.ttc)}
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">HT : {formatEuro(math.ht)}</span>
                      </td>

                      {/* Validity Date */}
                      <td className="py-4 px-6">
                        <span className="text-gray-700 dark:text-gray-300">
                          {new Date(quote.validUntil).toLocaleDateString('fr-FR')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(quote.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Aperçu professionnel PDF"
                            onClick={() => {
                              setSelectedQuote(quote);
                              setIsPreviewOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Modifier"
                            onClick={() => {
                              setSelectedQuote(quote);
                              loadFormForEdit(quote);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 dark:text-blue-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="Supprimer"
                            onClick={() => {
                              setSelectedQuote(quote);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    Aucune proposition commerciale trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/20 dark:bg-slate-900/40">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Page <strong>{currentPage}</strong> sur <strong>{totalPages}</strong> ({filteredQuotes.length} devis)
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

      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <h3 className="text-lg font-bold text-gray-950 dark:text-white">
                {isAddModalOpen ? 'Émettre une Proposition Commerciale' : 'Modifier le Devis'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }} 
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scroll Container */}
            <form id="quote-form" onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit} className="flex-1 overflow-y-auto my-4 pr-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Raison sociale du client</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TechFlow Solutions"
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Contact Principal</label>
                  <input
                    type="text"
                    required
                    placeholder="Sophie Martin"
                    value={formContactName}
                    onChange={(e) => setFormContactName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Objet du Devis</label>
                <input
                  type="text"
                  required
                  placeholder="Intégration d'outils cloud et migration"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* DYNAMIC LINE ITEMS MANAGEMENT */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800/60 space-y-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Lignes du Devis</span>
                
                {/* List items added */}
                <div className="space-y-2 max-h-[160px] overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/40">
                  {formItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs py-2 gap-2 text-gray-700 dark:text-gray-300">
                      <div className="flex-1 truncate pr-2 font-medium">
                        {item.description}
                      </div>
                      <div className="w-16 font-mono font-semibold text-center shrink-0">
                        x{item.quantity}
                      </div>
                      <div className="w-24 font-mono font-semibold text-right shrink-0">
                        {formatEuro(item.unitPrice)}
                      </div>
                      <div className="w-24 font-mono font-bold text-right shrink-0 text-gray-900 dark:text-white">
                        {formatEuro(item.quantity * item.unitPrice)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(index)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formItems.length === 0 && (
                    <p className="text-xs text-gray-400 italic py-2">Aucun article ajouté pour le moment.</p>
                  )}
                </div>

                {/* Interactive item adder row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/40 items-end">
                  <div className="sm:col-span-6">
                    <label className="text-[10px] text-gray-400 block mb-0.5">Description de l'article</label>
                    <input
                      type="text"
                      placeholder="Ex: Formation ou Support"
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-gray-400 block mb-0.5">Quantité</label>
                    <input
                      type="number"
                      placeholder="1"
                      value={newItemQty || ''}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-gray-400 block mb-0.5">Prix unitaire HT (€)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newItemPrice || ''}
                      onChange={(e) => setNewItemPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      title="Ajouter la ligne"
                    >
                      <Plus className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Taux de TVA (%)</label>
                  <input
                    type="number"
                    required
                    value={formTaxRate || ''}
                    onChange={(e) => setFormTaxRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Date de validité</label>
                  <input
                    type="date"
                    required
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Statut Commercial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as QuoteStatus)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-950 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DRAFT">Brouillon</option>
                    <option value="SENT">Envoyé</option>
                    <option value="ACCEPTED">Accepté</option>
                    <option value="REJECTED">Refusé</option>
                    <option value="EXPIRED">Expiré</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Conditions de règlement</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Ex: 30% d'acompte à la commande, solde à la livraison..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Running Total Indicator */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300 font-medium">
                <span>Total Estimé HT :</span>
                <span className="font-mono font-bold text-lg">{formatEuro(formItemsTotal)}</span>
              </div>
            </form>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="quote-form"
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-md shadow-blue-500/10"
              >
                {isAddModalOpen ? 'Générer le devis' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- DELETE PROPOSITION CONFIRMATION MODAL ---- */}
      {isDeleteModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsDeleteModalOpen(false)} />
          
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-gray-950 dark:text-white">Supprimer la proposition</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Êtes-vous sûr de vouloir supprimer la proposition <strong>{selectedQuote.quoteNumber} - {selectedQuote.title}</strong> ?
              Cette action supprimera également toutes ses lignes d'articles.
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
                Supprimer le devis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- PREMIUM PDF-LIKE PREVIEW MODAL ---- */}
      {isPreviewOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 md:p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Topbar of PDF viewer */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Visualiseur de documents</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{selectedQuote.quoteNumber}.pdf</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Imprimer
                </button>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

              {/* Aperçu du document (format A4) */}
            <div className="bg-white text-slate-800 p-6 md:p-10 rounded-xl shadow-md border border-gray-200/50 relative overflow-hidden text-sm">
              
              {/* Approval Watermark Overlay depending on Status */}
              {selectedQuote.status === 'ACCEPTED' && (
                <div className="absolute top-10 right-10 border-4 border-emerald-500/30 text-emerald-500/30 font-bold text-lg uppercase tracking-widest px-4 py-2 rounded-lg rotate-12 select-none pointer-events-none">
                  ACCEPTÉ ET SIGNÉ
                </div>
              )}
              {selectedQuote.status === 'SENT' && (
                <div className="absolute top-10 right-10 border-4 border-blue-500/30 text-blue-500/30 font-bold text-lg uppercase tracking-widest px-4 py-2 rounded-lg rotate-12 select-none pointer-events-none">
                  TRANSMIS LE {new Date().toLocaleDateString('fr-FR')}
                </div>
              )}
              {selectedQuote.status === 'DRAFT' && (
                <div className="absolute top-10 right-10 border-4 border-slate-400/30 text-slate-400/30 font-bold text-lg uppercase tracking-widest px-4 py-2 rounded-lg rotate-12 select-none pointer-events-none">
                   BROUILLON
                </div>
              )}

              {/* Invoice Brand / Header */}
              <div className="grid grid-cols-2 gap-4 pb-8 border-b border-slate-100">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{companyName}</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {companyAddress}<br />
                    SIRET : {companySiret}<br />
                     {companyName}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">PROPOSITION</h3>
                  <p className="text-xs text-slate-500 mt-2 font-mono">
                    Référence : <strong>{selectedQuote.quoteNumber}</strong><br />
                    Date : {new Date().toLocaleDateString('fr-FR')}<br />
                    Validité : {new Date(selectedQuote.validUntil).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Client & Billing addresses */}
              <div className="grid grid-cols-2 gap-4 py-8">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ÉMETTEUR</span>
                  <p className="text-xs font-semibold text-slate-800 mt-1">{companyName}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Service Facturation & Comptabilité<br />
                    Tél : 01 80 40 50 60
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">DESTINATAIRE</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">{selectedQuote.companyName}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    À l'attention de : <strong>{selectedQuote.contactName}</strong><br />
                    Département Achats & Approvisionnement
                  </p>
                </div>
              </div>

              {/* Description line */}
              <div className="mb-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">OBJET COMMERCIAL</span>
                <p className="text-sm font-semibold text-slate-800 mt-1">{selectedQuote.title}</p>
              </div>

              {/* Items Table inside PDF preview */}
              <table className="w-full text-left border-collapse border-b border-slate-100 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Description du service ou matériel</th>
                    <th className="py-2.5 px-3 text-center w-16">Qté</th>
                    <th className="py-2.5 px-3 text-right w-24">Prix Unit. HT</th>
                    <th className="py-2.5 px-3 text-right w-24">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedQuote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-medium text-slate-950">{item.description}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatEuro(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatEuro(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Quote totals computation right box */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Total HT :</span>
                    <span className="font-mono">{formatEuro(getQuoteMath(selectedQuote).ht)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>TVA ({selectedQuote.taxRate}%) :</span>
                    <span className="font-mono">{formatEuro(getQuoteMath(selectedQuote).tax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-slate-900">
                    <span>TOTAL TTC :</span>
                    <span className="font-mono">{formatEuro(getQuoteMath(selectedQuote).ttc)}</span>
                  </div>
                </div>
              </div>

              {/* Fine terms / Payment methods */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 text-[10px] text-slate-400">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider block">CONDITIONS GÉNÉRALES</span>
                  <p className="mt-1 leading-relaxed">
                    {selectedQuote.notes || "Paiement à réception. Devis valable pour une durée de 30 jours à compter de la date d'émission."}<br />
                    Taux de pénalité de retard : 3 fois le taux d'intérêt légal. Indemnité forfaitaire de 40€ pour frais de recouvrement.
                  </p>
                </div>
                <div className="flex flex-col items-end justify-end">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">SIGNATURE & BON POUR ACCORD</span>
                  <div className="w-48 h-16 border border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50/50 text-[9px] text-slate-300">
                    {selectedQuote.status === 'ACCEPTED' ? (
                      <span className="text-emerald-500 font-bold font-serif italic text-xs rotate-3">Signé commercialement</span>
                    ) : (
                      "Cadre réservé à la signature client"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom buttons outside printable paper sheet */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
