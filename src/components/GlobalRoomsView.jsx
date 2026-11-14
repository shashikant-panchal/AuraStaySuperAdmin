import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { BedDouble, Search, Building2, CheckCircle2, AlertTriangle, Wrench, Sparkles, Trash2, X } from 'lucide-react';

export default function GlobalRoomsView() {
  const { globalRooms, hotels, deleteRoom } = useSuperAdmin();
  const [search, setSearch] = useState('');
  const [roomToDelete, setRoomToDelete] = useState(null);

  const getHotelName = (hotelId) => {
    const h = hotels.find(item => item.id === hotelId);
    return h ? h.name : (hotelId || 'Property');
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
              <th className="py-3.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <BedDouble className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                  No rooms loaded. Rooms created by Hotel Admins will sync here in real time.
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
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => setRoomToDelete(r)}
                      title={`Delete Room ${r.room_number}`}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Super Admin Custom Delete Room Modal */}
      {roomToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setRoomToDelete(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Delete Room</span>
                    <span className="font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-lg text-sm">
                      #{roomToDelete.room_number}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tenant: <strong className="text-white">{getHotelName(roomToDelete.hotel_id)}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setRoomToDelete(null)}
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800/80 text-xs flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{roomToDelete.type || 'Standard Room'}</div>
                <div className="text-slate-500 text-[11px]">{roomToDelete.floor} • {roomToDelete.bed}</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-emerald-400">₹{Number(roomToDelete.price || 2000).toLocaleString('en-IN')}/nt</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{roomToDelete.status}</span>
              </div>
            </div>

            <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-300 leading-relaxed">
              <strong className="text-rose-200">Warning:</strong> Permanently deleting this room will remove it from hotel inventory, the Stayview calendar, and live booking channels.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setRoomToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteRoom(roomToDelete.id, roomToDelete.room_number, roomToDelete.hotel_id);
                  setRoomToDelete(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Room Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

