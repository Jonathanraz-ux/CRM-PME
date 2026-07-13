/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Check,
  DollarSign,
  ShieldCheck,
  Save,
  CheckCircle,
  Sparkles,
  RefreshCw,
  LayoutList,
  LayoutGrid,
  Rows3
} from 'lucide-react';
import { CompanySettings } from '../types';
import { useUiPrefs } from '../hooks/useUiPrefs';

interface SettingsViewProps {
  settings: CompanySettings;
  onUpdateSettings: (settings: CompanySettings) => void;
}

export default function SettingsView({
  settings,
  onUpdateSettings
}: SettingsViewProps) {
  // Local state form
  const [name, setName] = useState(settings.name);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [website, setWebsite] = useState(settings.website);
  const [siret, setSiret] = useState(settings.siret);
  const [vatNumber, setVatNumber] = useState(settings.vatNumber);
  const [currency, setCurrency] = useState(settings.currency);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);

  // Saved successfully status banner
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      name,
      email,
      phone,
      address,
      website,
      siret,
      vatNumber,
      currency,
      primaryColor
    });
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  const colors = [
    { name: 'Bleu Corporate', hex: '#3B82F6', label: 'bg-blue-500' },
    { name: 'Émeraude Croissance', hex: '#10B981', label: 'bg-emerald-500' },
    { name: 'Indigo Premium', hex: '#6366F1', label: 'bg-indigo-500' },
    { name: 'Ambre Énergie', hex: '#F59E0B', label: 'bg-amber-500' },
    { name: 'Violet Innovation', hex: '#8B5CF6', label: 'bg-violet-500' }
  ];

  const { view, density, setView, setDensity } = useUiPrefs();

  const segmentClass = (active: boolean) =>
    active
      ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/10'
      : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 text-gray-700 dark:text-gray-400';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* View Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Paramètres Entreprise</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configurez l'identité légale de votre PME et le style de vos documents commerciaux
        </p>
      </div>

      {/* Success Banner */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2.5 animate-in fade-in duration-150">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>Paramètres enregistrés avec succès ! Le style de vos devis a été mis à jour.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Coordonnées générales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <Building className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Identité & Coordonnées</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Raison Sociale</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Adresse Site Web</label>
              <input
                type="text"
                required
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Adresse de messagerie</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Numéro de téléphone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Adresse administrative de facturation</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Card 2: Informations administratives de l'entreprise */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Données Fiscales & Légales</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Numéro SIRET</label>
              <input
                type="text"
                required
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Numéro TVA Intracommunautaire</label>
              <input
                type="text"
                required
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Devise des Transactions</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
            >
              <option value="EUR (€)">Euro (€)</option>
              <option value="USD ($)">US Dollar ($)</option>
              <option value="GBP (£)">Livre Sterling (£)</option>
              <option value="CHF (CHF)">Franc Suisse (CHF)</option>
            </select>
          </div>
        </div>

        {/* Card 3: Color and Branding preset */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Identité Visuelle & Thème</h3>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Couleur primaire de l'application</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {colors.map((c) => {
                const isSelected = primaryColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setPrimaryColor(c.hex)}
                    className={`flex items-center gap-3 p-3 text-xs font-semibold rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/10' 
                        : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/30 text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${c.label} shrink-0 block`} />
                    <span className="flex-1">{c.name}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 3b: Modes d'affichage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Modes d'affichage</h3>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vue des listes</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setView('table')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all ${segmentClass(view === 'table')}`}
              >
                <LayoutList className="w-4 h-4" />
                Tableau
              </button>
              <button
                type="button"
                onClick={() => setView('card')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all ${segmentClass(view === 'card')}`}
              >
                <LayoutGrid className="w-4 h-4" />
                Cartes
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Densité</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDensity('comfort')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all ${segmentClass(density === 'comfort')}`}
              >
                <Rows3 className="w-4 h-4" />
                Confort
              </button>
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-xl border transition-all ${segmentClass(density === 'compact')}`}
              >
                <Rows3 className="w-4 h-4" />
                Compact
              </button>
            </div>
          </div>
        </div>

        {/* Card 4: Rappel d'usage des paramètres */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/60 dark:to-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 md:p-6 space-y-2">
          <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h4 className="text-sm font-bold uppercase tracking-wider">Utilisation des paramètres</h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Ces informations légales et la couleur de marque sont automatiquement appliquées sur vos devis et documents commerciaux générés.
          </p>
        </div>

        {/* Form Submit bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
