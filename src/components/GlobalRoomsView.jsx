import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { BedDouble, Search, Building2, CheckCircle2, AlertTriangle, Wrench, Sparkles } from 'lucide-react';

export default function GlobalRoomsView() {
  const { globalRooms, hotels } = useSuperAdmin();
  const [search, setSearch] = useState('');

  const getHotelName = (hotelId) => {
    const h = hotels.find(item => item.id === hotelId);
    return h ? h.name : 'AuraStay Suite';
  };

  const filteredRooms = globalRooms.filter(r => {
    const hotelName = getHotelName(r.hotel_id);
    const num = r.room_number || '';
    const type = r.type || '';
    const q = search.toLowerCase();
    return hotelName.toLowerCase().includes(q) || num.toLowerCase().includes(q) || type.toLowerCase().includes(q);
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Global Rooms Inventory</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {filteredRooms.length} Rooms Loaded
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-tenant room inventory, floor allocation, and real-time operational status
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search room number, type, hotel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-5">Room #</th>
              <th className="py-3.5 px-4">Hotel Tenant</th>
              <th className="py-3.5 px-4">Category & Bed</th>
              <th className="py-3.5 px-4">Floor</th>
              <th className="py-3.5 px-4">Base Rate / Night</th>
              <th className="py-3.5 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  <BedDouble className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                  No rooms loaded. Rooms created by Hotel Admins in the PMS will sync here in real time.
                </td>
              </tr>
            ) : (
              filteredRooms.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 px-5 font-mono font-bold text-white text-sm">
                    {r.room_number}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{getHotelName(r.hotel_id)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-slate-200 font-medium">{r.type}</div>
                    <div className="text-[11px] text-slate-500">{r.bed}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-400 font-medium">
                    {r.floor}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                    ₹{Number(r.price || 2000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      r.status === 'VACANT_READY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : r.status === 'OCCUPIED'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : r.status === 'DIRTY'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
