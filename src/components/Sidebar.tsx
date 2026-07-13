/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userName?: string;
  userRole?: string;
}

export default function Sidebar({
  currentView,
  setCurrentView,
  isOpen,
  setIsOpen,
  userName = 'Utilisateur',
  userRole = 'Administrateur'
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads & Opportunités', icon: Briefcase },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'quotes', label: 'Devis', icon: FileText },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div 
          id="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        id="sidebar-container"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r transition-transform duration-300 ease-in-out lg:translate-x-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white font-bold italic shadow-lg shadow-blue-200 dark:shadow-none">
              N
            </div>
            <div>
              <span className="text-lg font-bold text-slate-800 dark:text-white tracking-tight block leading-none">Nova CRM</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase mt-0.5 block">Solutions PME</span>
            </div>
          </div>
          
          <button 
            id="close-sidebar-button"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {/* Section: Navigation */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">
              Navigation
            </div>
            {menuItems
              .filter((item) => item.id !== 'settings')
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    id={`sidebar-item-${item.id}`}
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsOpen(false); // Close drawer on mobile click
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                        : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-150 shrink-0 ${isActive ? 'scale-105' : 'opacity-80'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                );
              })}
          </div>

          {/* Section: Organisation */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 px-4">
              Organisation
            </div>
            {menuItems
              .filter((item) => item.id === 'settings')
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    id={`sidebar-item-${item.id}`}
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                        : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-150 shrink-0 ${isActive ? 'scale-105' : 'opacity-80'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </button>
                );
              })}
          </div>
        </nav>

        {/* Bottom Profile and Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{userName}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-medium">{userRole}</span>
              </div>
            </div>
          </div>
      </aside>
    </>
  );
}
