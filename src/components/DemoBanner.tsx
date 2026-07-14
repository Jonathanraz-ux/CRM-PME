import React from 'react';
import { Info, ExternalLink, Eye } from 'lucide-react';
import { DEMO_WHATSAPP_NUMBER, DEMO_WHATSAPP_MESSAGE } from '../data/demo-data';

const whatsappUrl = `https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encodeURIComponent(DEMO_WHATSAPP_MESSAGE)}`;

interface DemoBannerProps {
  companyName?: string;
}

export default function DemoBanner({ companyName = 'Nova CRM' }: DemoBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block text-blue-100">
              Mode démonstration
            </span>
            <p className="text-xs text-blue-100/90 leading-snug">
              Les données affichées sont fictives. Vous pouvez explorer librement le dashboard, mais les modifications ne seront pas enregistrées.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl border border-white/20 transition-all whitespace-nowrap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Demander un dashboard similaire
          </a>
        </div>
      </div>
    </div>
  );
}
