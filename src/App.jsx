import React from 'react';
import { useSuperAdmin } from './context/SuperAdminContext';
import SuperAdminLogin from './components/SuperAdminLogin';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MetricCards from './components/MetricCards';
import HotelsTableView from './components/HotelsTableView';
import GlobalBookingsView from './components/GlobalBookingsView';
import GlobalRoomsView from './components/GlobalRoomsView';
import CreateHotelModal from './components/CreateHotelModal';
import EditHotelModal from './components/EditHotelModal';
import DatabaseSyncModal from './components/DatabaseSyncModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const { isAuthenticated, activeTab, notification } = useSuperAdmin();

  if (!isAuthenticated) {
    return <SuperAdminLogin />;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-semibold text-white">
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <Header />

      <div className="flex-1 flex min-w-0">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Main Content View */}
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6 overflow-y-auto">
          {/* SaaS High-Level Metrics */}
          <MetricCards />

          {/* Active View */}
          {activeTab === 'hotels' && <HotelsTableView />}
          {activeTab === 'bookings' && <GlobalBookingsView />}
          {activeTab === 'rooms' && <GlobalRoomsView />}
        </main>
      </div>

      {/* Modals */}
      <CreateHotelModal />
      <EditHotelModal />
      <DatabaseSyncModal />
    </div>
  );
}

