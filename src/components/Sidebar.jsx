import React from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { 
  Building2, 
  CalendarCheck, 
  BedDouble, 
  BarChart3, 
  Database,
  ShieldCheck,
  ExternalLink,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, metrics, setIsSqlModalOpen } = useSuperAdmin();

  const navItems = [
    { id: 'hotels', label: 'Hotel Tenants', icon: Building2, count: metrics.totalHotels },
    { id: 'bookings', label: 'Global Bookings', icon: CalendarCheck, count: metrics.totalBookings },
    { id: 'rooms', label: 'Global Rooms', icon: BedDouble, count: metrics.totalRooms },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4">
      {/* Navigation Links */}
      <div className="space-y-1">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 mb-2">
          SaaS Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ecosystem Portals Quick Launch */}
      <div className="mt-8 pt-6 border-t border-slate-800 space-y-2">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 mb-2">
          Ecosystem Portals
        </div>

        <a
          href="https://shashikant-panchal.github.io/AuraStay/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition group"
        >
          <span className="truncate">Hotel Admin Portal</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
        </a>

        <a
          href="https://shashikant-panchal.github.io/AuraStayBooking/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60 transition group"
        >
          <span className="truncate">Guest Booking Engine</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
        </a>
      </div>

      {/* Bottom Info Card */}
      <div className="mt-auto pt-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-950 border border-indigo-900/40 text-xs">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Enterprise Cloud</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Centralized property management with real-time multi-hotel synchronization.
          </p>
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="mt-2.5 w-full py-1.5 px-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-bold text-center block transition"
          >
            Copy SQL Script
          </button>
        </div>
      </div>
    </aside>
  );
}

