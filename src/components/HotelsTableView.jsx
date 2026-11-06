import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { 
  Building2, 
  Search, 
  Filter, 
  ExternalLink, 
  Edit3, 
  Power, 
  KeyRound, 
  MapPin, 
  Mail, 
  Phone, 
  BedDouble,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Plus
} from 'lucide-react';

export default function HotelsTableView() {
  const { 
    hotels, 
    toggleHotelStatus, 
    setEditingHotel, 
    setIsCreateHotelModalOpen,
    globalRooms,
    globalReservations,
    showNotification
  } = useSuperAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredHotels = hotels.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
                        h.slug.toLowerCase().includes(search.toLowerCase()) ||
                        h.email.toLowerCase().includes(search.toLowerCase()) ||
                        (h.city && h.city.toLowerCase().includes(search.toLowerCase()));
    if (!matchSearch) return false;
    if (statusFilter !== 'ALL' && h.status !== statusFilter) return false;
    return true;
  });

  const getHotelRoomCount = (hotelId) => {
    const directRooms = globalRooms.filter(r => (!r.hotel_id && hotelId === 'hotel_aurastay_01') || r.hotel_id === hotelId);
    if (directRooms.length > 0) return directRooms.length;
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel?.totalRooms || 0;
  };

  const getHotelBookingCount = (hotelId) => {
    return globalReservations.filter(r => r.hotel_id === hotelId).length;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Hotel Tenants & Admins</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              {filteredHotels.length} Registered
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage hotel properties, admin login credentials, and public booking portals
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hotel, slug, admin email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-60"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <button
            onClick={() => setIsCreateHotelModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hotel</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-5">Hotel / Brand</th>
              <th className="py-3.5 px-4">Admin Login Credentials</th>
              <th className="py-3.5 px-4">Location & Owner</th>
              <th className="py-3.5 px-4 text-center">Rooms</th>
              <th className="py-3.5 px-4 text-center">Bookings</th>
              <th className="py-3.5 px-4">Plan / Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredHotels.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                  No hotel tenants match your search.
                </td>
              </tr>
            ) : (
              filteredHotels.map((h) => {
                const roomCount = getHotelRoomCount(h.id);
                const bookingCount = getHotelBookingCount(h.id);

                return (
                  <tr key={h.id} className="hover:bg-slate-800/30 transition">
                    {/* Hotel Brand */}
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {h.logoUrl ? (
                            <img src={h.logoUrl} alt={h.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{h.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                              {h.shortName || 'AST'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            slug: {h.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Admin Credentials */}
                    <td className="py-4 px-4 font-mono">
                      <div className="text-slate-200 font-semibold flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{h.email}</span>
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <KeyRound className="w-3 h-3 text-amber-500/70" />
                        <span>pass: {h.password}</span>
                      </div>
                    </td>

                    {/* Location & Owner */}
                    <td className="py-4 px-4">
                      <div className="text-slate-300 font-medium">{h.ownerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[180px]">{h.city || 'Bhubaneswar'}, {h.address || 'India'}</span>
                      </div>
                    </td>

                    {/* Rooms */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-white font-mono bg-slate-800/80 px-2 py-1 rounded-lg">
                        {roomCount}
                      </span>
                    </td>

                    {/* Bookings */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">
                        {bookingCount}
                      </span>
                    </td>

                    {/* Status & Plan */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${h.status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                          {h.status}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                          {h.plan || 'Pro'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Open Guest Booking for this Hotel */}
                        <a
                          href={`https://shashikant-panchal.github.io/AuraStayBooking/?hotel=${h.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition"
                          title="Open Guest Booking Portal for this hotel"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Edit Hotel */}
                        <button
                          onClick={() => setEditingHotel(h)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 transition"
                          title="Edit Hotel & Password"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Active / Suspended */}
                        <button
                          onClick={() => toggleHotelStatus(h.id)}
                          className={`p-1.5 rounded-lg transition ${
                            h.status === 'ACTIVE'
                              ? 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400'
                              : 'bg-slate-800 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400'
                          }`}
                          title={h.status === 'ACTIVE' ? 'Suspend Hotel' : 'Activate Hotel'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

