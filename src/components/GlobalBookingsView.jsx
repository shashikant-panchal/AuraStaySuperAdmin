import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { CalendarCheck, Search, Building2, User, CreditCard, Clock, IndianRupee } from 'lucide-react';

export default function GlobalBookingsView() {
  const { globalReservations, hotels } = useSuperAdmin();
  const [search, setSearch] = useState('');

  const getHotelName = (hotelId) => {
    const h = hotels.find(item => item.id === hotelId);
    return h ? h.name : 'AuraStay Suite';
  };

  const filteredBookings = globalReservations.filter(r => {
    const hotelName = getHotelName(r.hotel_id);
    const guest = r.guest || '';
    const id = r.id || '';
    const q = search.toLowerCase();
    return hotelName.toLowerCase().includes(q) || guest.toLowerCase().includes(q) || id.toLowerCase().includes(q);
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Global Bookings Stream</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              {filteredBookings.length} Bookings
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time feed of guest bookings across all tenant hotels
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, guest, hotel..."
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
              <th className="py-3.5 px-5">Booking ID</th>
              <th className="py-3.5 px-4">Hotel Tenant</th>
              <th className="py-3.5 px-4">Guest Details</th>
              <th className="py-3.5 px-4">Room & Dates</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Payment</th>
              <th className="py-3.5 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <CalendarCheck className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                  No guest bookings recorded yet.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-4 px-5 font-mono font-bold text-indigo-400">
                    {b.id}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{getHotelName(b.hotel_id)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-slate-200 font-medium">{b.guest}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{b.guest_email || b.guest_phone || 'Walk-in / Direct'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-slate-300 font-medium">{b.room}</div>
                    <div className="text-[11px] text-slate-500">{b.check_in} → {b.check_out}</div>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-white">
                    ₹{Number(b.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.payment === 'PAID'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {b.payment || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {b.status || 'CONFIRMED'}
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
