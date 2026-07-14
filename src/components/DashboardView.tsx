/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  UserCheck, 
  Briefcase, 
  Calendar,
  ChevronRight,
  Plus,
  ArrowUpRight,
  FileText,
  Users
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Lead, Client, Quote, Activity } from '../types';

interface DashboardViewProps {
  leads: Lead[];
  clients: Client[];
  quotes: Quote[];
  activities: Activity[];
  onNavigate: (view: string) => void;
  onAddLead: () => void;
  demoMode?: boolean;
}

export default function DashboardView({
  leads,
  clients,
  quotes,
  activities,
  onNavigate,
  onAddLead,
  demoMode = false
}: DashboardViewProps) {

  // ---- 1. METRICS CALCULATIONS ----
  
  // Total potential pipeline (all leads except WON/LOST)
  const activeStatuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'];
  const pipelineValue = leads
    .filter(l => activeStatuses.includes(l.status))
    .reduce((sum, l) => sum + l.value, 0);

  // Total won revenue
  const wonRevenue = leads
    .filter(l => l.status === 'WON')
    .reduce((sum, l) => sum + l.value, 0);

  // Active leads count
  const activeLeadsCount = leads.filter(l => activeStatuses.includes(l.status)).length;

  // Conversion rate: Won / (Won + Lost)
  const wonCount = leads.filter(l => l.status === 'WON').length;
  const lostCount = leads.filter(l => l.status === 'LOST').length;
  const totalClosed = wonCount + lostCount;
  const conversionRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

  // ---- 2. CHART DATA PREPARATION ----

  // Data for Lead Value per Status
  const statusLabels: Record<string, string> = {
    'NEW': 'Nouveau',
    'CONTACTED': 'Contacté',
    'QUALIFIED': 'Qualifié',
    'PROPOSAL': 'Proposition',
    'NEGOTIATION': 'Négociation',
    'WON': 'Gagné',
    'LOST': 'Perdu'
  };

  const statusValues = Object.keys(statusLabels).map(status => {
    const value = leads
      .filter(l => l.status === status)
      .reduce((sum, l) => sum + l.value, 0);
    return {
      statusKey: status,
      name: statusLabels[status],
      value: value
    };
  });

  // Data for Lead Source Distribution
  const sourceMap: Record<string, number> = {};
  leads.forEach(l => {
    sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#64748B'];
  const sourceData = Object.keys(sourceMap).map(source => ({
    name: source,
    value: sourceMap[source]
  }));

  // Timeline latest activities
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Format currency
  function formatEuro(value: number) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Tableau de bord</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pilotez votre activité commerciale en temps réel
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="quick-add-lead-btn"
            onClick={onAddLead}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouveau Lead
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md duration-150">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pipeline Actif</span>
            <h3 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">{formatEuro(pipelineValue)}</h3>
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>Opportunités en cours</span>
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md duration-150">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chiffre d'Affaires</span>
            <h3 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">{formatEuro(wonRevenue)}</h3>
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>Signé & validé</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md duration-150">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Leads Actifs</span>
            <h3 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">{activeLeadsCount}</h3>
            <p className="text-[11px] text-gray-400">
              Dans le tunnel de vente
            </p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md duration-150">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Taux de conversion</span>
            <h3 className="text-2xl font-bold text-gray-950 dark:text-white tracking-tight">{conversionRate}%</h3>
            <p className="text-[11px] text-gray-400">
              Sur les opportunités closes
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Status Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-gray-950 dark:text-white">Poids du Pipeline par Étape</h4>
              <p className="text-xs text-gray-400 mt-0.5">Valeur estimée totale (€)</p>
            </div>
          </div>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusValues} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value} €`, 'Valeur']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={36}
                >
                  {statusValues.map((entry, index) => {
                    // Different colors for won/lost/active
                    let color = '#3B82F6'; // Default active blue
                    if (entry.statusKey === 'WON') color = '#10B981'; // green
                    if (entry.statusKey === 'LOST') color = '#EF4444'; // red
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Pie Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-gray-950 dark:text-white mb-1">Origine des Prospects</h4>
            <p className="text-xs text-gray-400">Canaux d'acquisition les plus performants</p>
          </div>

          <div className="h-[180px] my-3 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: any) => [`${val} prospects`, 'Volume']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center text for Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{leads.length}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Prospects</span>
            </div>
          </div>

          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-400">
            {sourceData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History timeline + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Timeline of Activities */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="text-sm font-bold text-gray-950 dark:text-white">Historique d'activité de l'équipe</h4>
              <p className="text-xs text-gray-400 mt-0.5">Dernières interactions commerciales</p>
            </div>
            <button 
              onClick={() => onNavigate('leads')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
            >
              Voir les opportunités
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="relative border-l-2 border-gray-100 dark:border-slate-800 ml-3 pl-5 space-y-6">
            {recentActivities.map((act) => {
              // Icon color logic
              let colorClasses = 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
              if (act.type === 'MEETING') colorClasses = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400';
              if (act.type === 'STATUS_CHANGE') colorClasses = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400';
              if (act.type === 'CALL') colorClasses = 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400';

              return (
                <div key={act.id} className="relative">
                  {/* Circle dot anchor */}
                  <span className={`absolute -left-[29px] top-1 flex items-center justify-center w-5 h-5 rounded-full ring-4 ring-white dark:ring-slate-900 ${colorClasses}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  </span>

                  <div>
                    <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                      {new Date(act.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                      {act.title}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {act.description}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-semibold">
                      Par {act.user}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-gray-950 dark:text-white">Raccourcis rapides</h4>
            <p className="text-xs text-gray-400 mt-0.5">Actions de gestion courantes</p>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={onAddLead}
              className="flex items-center gap-3 w-full p-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/40 rounded-xl hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900/40"
            >
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                <Plus className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-bold">Ajouter un prospect</p>
                <p className="text-[10px] text-gray-400 font-normal">Enregistrer une opportunité</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('quotes')}
              className="flex items-center gap-3 w-full p-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/40 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/40"
            >
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-bold">Créer un devis</p>
                <p className="text-[10px] text-gray-400 font-normal">Facturer ou faire une proposition</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('clients')}
              className="flex items-center gap-3 w-full p-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/40 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/40"
            >
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                <Users className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-bold">Base Clients</p>
                <p className="text-[10px] text-gray-400 font-normal">Consulter vos comptes actifs</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
