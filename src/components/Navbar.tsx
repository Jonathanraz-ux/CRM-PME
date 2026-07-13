/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sun,
  Moon,
  Bell,
  Menu,
  Search,
  Clock,
  Briefcase,
  LogOut,
  User,
  FileText,
  TrendingUp
} from 'lucide-react';
import { Activity, Lead, Client, Quote } from '../types';

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  companyName: string;
  activities: Activity[];
  userName?: string;
  userRole?: string;
  onSignOut?: () => void;
  leads?: Lead[];
  clients?: Client[];
  quotes?: Quote[];
  onNavigate?: (view: string) => void;
}

export default function Navbar({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  setDarkMode,
  companyName,
  activities,
  userName = 'Utilisateur',
  userRole = 'Administrateur',
  onSignOut,
  leads = [],
  clients = [],
  quotes = [],
  onNavigate
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { leads: [], clients: [], quotes: [] };
    const matchLeads = leads
      .filter((l) => `${l.name} ${l.company} ${l.email}`.toLowerCase().includes(q))
      .slice(0, 5);
    const matchClients = clients
      .filter((c) => `${c.companyName} ${c.contactName} ${c.email}`.toLowerCase().includes(q))
      .slice(0, 5);
    const matchQuotes = quotes
      .filter((q2) => `${q2.quoteNumber} ${q2.companyName} ${q2.title}`.toLowerCase().includes(q))
      .slice(0, 5);
    return { leads: matchLeads, clients: matchClients, quotes: matchQuotes };
  }, [query, leads, clients, quotes]);

  const hasResults = results.leads.length + results.clients.length + results.quotes.length > 0;

  const goTo = (view: string) => {
    onNavigate?.(view);
    setQuery('');
    setSearchOpen(false);
  };

  // Take latest 5 activities for notification panel
  const latestActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  const formatActivityDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      {/* Left side: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          id="toggle-sidebar-mobile"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:block">
          <h1 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Espace Entreprise
          </h1>
          <p className="text-base font-semibold text-gray-950 dark:text-white leading-tight">
            {companyName}
          </p>
        </div>
      </div>

        {/* Center: Recherche globale */}
        <div className="flex-1 max-w-md mx-4 md:mx-8 hidden md:block">
          <div className={`relative flex items-center rounded-xl border transition-all duration-150 ${
            searchFocused 
              ? 'border-blue-500 ring-2 ring-blue-500/10' 
              : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30'
          }`}>
            <Search className="w-4.5 h-4.5 ml-3 text-gray-400 shrink-0" />
            <input
              id="global-search"
              type="text"
              value={query}
              placeholder="Rechercher un lead, un client ou un devis..."
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => { setSearchFocused(true); setSearchOpen(true); }}
              onBlur={() => { setSearchFocused(false); setTimeout(() => setSearchOpen(false), 150); }}
              className="w-full px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />

            {(searchOpen && query.trim()) && (
              <div className="absolute top-full mt-2 right-0 left-0 z-40 max-h-[70vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl ring-1 ring-black/5 py-2">
                {!hasResults && (
                  <div className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    Aucun résultat pour « {query.trim()} »
                  </div>
                )}

                {results.leads.length > 0 && (
                  <div className="px-3 pb-1 pt-1">
                    <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Leads</p>
                    {results.leads.map((l) => (
                      <button
                        key={l.id}
                        onMouseDown={() => goTo('leads')}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60 text-left"
                      >
                        <TrendingUp className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{l.name}</span>
                        <span className="text-[11px] text-gray-400 truncate">— {l.company}</span>
                      </button>
                    ))}
                  </div>
                )}

                {results.clients.length > 0 && (
                  <div className="px-3 pb-1 pt-1 border-t border-gray-100 dark:border-slate-800/60">
                    <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Clients</p>
                    {results.clients.map((c) => (
                      <button
                        key={c.id}
                        onMouseDown={() => goTo('clients')}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60 text-left"
                      >
                        <User className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{c.companyName}</span>
                        <span className="text-[11px] text-gray-400 truncate">— {c.contactName}</span>
                      </button>
                    ))}
                  </div>
                )}

                {results.quotes.length > 0 && (
                  <div className="px-3 pb-1 pt-1 border-t border-gray-100 dark:border-slate-800/60">
                    <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Devis</p>
                    {results.quotes.map((q) => (
                      <button
                        key={q.id}
                        onMouseDown={() => goTo('quotes')}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/60 text-left"
                      >
                        <FileText className="w-4 h-4 text-violet-500 shrink-0" />
                        <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">{q.quoteNumber}</span>
                        <span className="text-[11px] text-gray-400 truncate">— {q.companyName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Dark Mode Toggle */}
        <button
          id="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
          title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors ${
              showNotifications ? 'bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-white' : ''
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              {/* Overlay blocker to close */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowNotifications(false)}
              />
              <div
                id="notifications-dropdown"
                className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] z-20 origin-top-right rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xl ring-1 ring-black/5 py-1"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-gray-950 dark:text-white">Flux d'activités</h3>
                  <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                    Temps réel
                  </span>
                </div>
                
                <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/40">
                  {latestActivities.length > 0 ? (
                    latestActivities.map((act) => (
                      <div key={act.id} className="p-3.5 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <div className="flex gap-2.5 items-start">
                          <div className="mt-0.5 p-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-slate-100 leading-tight">
                              {act.title}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {act.description}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{formatActivityDate(act.date)}</span>
                              <span>•</span>
                              <span>{act.user}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-gray-500">
                      Aucune activité enregistrée
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800">
          {onSignOut && (
            <button
              id="sign-out-btn"
              onClick={onSignOut}
              title="Se déconnecter"
              className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 font-semibold text-sm">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left leading-none">
            <p className="text-xs font-semibold text-gray-950 dark:text-white">{userName}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
