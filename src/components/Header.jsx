import React from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { 
  ShieldCheck, 
  Plus, 
  Database, 
  LogOut, 
  Globe, 
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Header() {
  const { 
    currentAdmin, 
    logout, 
    setIsCreateHotelModalOpen, 
    setIsSqlModalOpen,
    metrics
  } = useSuperAdmin();

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Branding & Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white tracking-tight">AuraStay</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                SuperAdmin
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Multi-Tenant Hospitality Ecosystem
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-400">Live Realtime Synced</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-semibold">{metrics.activeHotels} Active Hotels</span>
        </div>
      </div>

      {/* Right: Actions & Admin Profile */}
      <div className="flex items-center space-x-3">
        {/* SQL Schema helper button */}
        <button
          onClick={() => setIsSqlModalOpen(true)}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition"
          title="View & Copy Supabase Multi-Tenant SQL Migration"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>SQL Schema</span>
        </button>

        {/* Create Hotel Tenant button */}
        <button
          onClick={() => setIsCreateHotelModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Hotel</span>
        </button>

        {/* Profile & Logout */}
        <div className="pl-2 border-l border-slate-800 flex items-center space-x-3">
          <div className="hidden lg:block text-right">
            <div className="text-xs font-bold text-white">{currentAdmin.name}</div>
            <div className="text-[10px] text-indigo-400 font-mono">{currentAdmin.email}</div>
          </div>

          <button
            onClick={logout}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 flex items-center justify-center transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
