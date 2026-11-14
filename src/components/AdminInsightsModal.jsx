import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import {
  X,
  Building2,
  KeyRound,
  Mail,
  Phone,
  MapPin,
  User,
  BedDouble,
  CalendarCheck,
  IndianRupee,
  Trash2,
  Edit3,
  Power,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Utensils,
  Car,
  Sparkles,
  FileText,
  Save,
  Plus
} from 'lucide-react';

export default function AdminInsightsModal() {
  const {
    selectedInsightHotel,
    setSelectedInsightHotelId,
    setEditingHotel,
    globalRooms = [],
    globalRoomTypes = [],
    globalReservations = [],
    globalFnbOrders = [],
    globalCabBookings = [],
    globalHkTasks = [],
    globalInvoices = [],
    deleteRoom,
    updateHotelRoomLimit,
    toggleHotelStatus,
    showNotification
  } = useSuperAdmin();

  const [showPassword, setShowPassword] = useState(false);
  const [customLimit, setCustomLimit] = useState(0);
  const [confirmDeleteRoomObj, setConfirmDeleteRoomObj] = useState(null);

  useEffect(() => {
    if (selectedInsightHotel) {
      setCustomLimit(Number(selectedInsightHotel.totalRooms) || 0);
    }
  }, [selectedInsightHotel]);

  if (!selectedInsightHotel) return null;

  const h = selectedInsightHotel;
  const hIdLower = String(h.id || '').trim().toLowerCase();
  const hSlugLower = String(h.slug || '').trim().toLowerCase();

  const matchesHotel = (recordHotelId) => {
    const val = String(recordHotelId || '').trim().toLowerCase();
    return val && (val === hIdLower || val === hSlugLower);
  };

  const hotelRooms = globalRooms.filter(r => matchesHotel(r.hotel_id));
  const hotelRoomTypes = globalRoomTypes.filter(rt => matchesHotel(rt.hotel_id));
  const hotelReservations = globalReservations.filter(res => matchesHotel(res.hotel_id));
  const hotelFnb = globalFnbOrders.filter(o => matchesHotel(o.hotel_id));
  const hotelCabs = globalCabBookings.filter(c => matchesHotel(c.hotel_id));
  const hotelHk = globalHkTasks.filter(t => matchesHotel(t.hotel_id));
  const hotelInvoices = globalInvoices.filter(inv => matchesHotel(inv.hotel_id));

  const assignedRoomsLimit = Number(h.totalRooms) || 0;
  const createdRoomsCount = hotelRooms.length;
  const remainingRoomsQuota = Math.max(0, assignedRoomsLimit - createdRoomsCount);
  const isLimitReached = assignedRoomsLimit > 0 && createdRoomsCount >= assignedRoomsLimit;
  const usagePercent = assignedRoomsLimit > 0
    ? Math.min(100, Math.round((createdRoomsCount / assignedRoomsLimit) * 100))
    : (createdRoomsCount > 0 ? 100 : 0);

  const vacantRoomsCount = hotelRooms.filter(r => r.status === 'VACANT_READY' || !r.status).length;
  const occupiedRoomsCount = hotelRooms.filter(r => r.status === 'OCCUPIED').length;
  const dirtyRoomsCount = hotelRooms.filter(r => r.status === 'DIRTY').length;
  const maintenanceRoomsCount = hotelRooms.filter(
    r => r.status === 'MAINTENANCE' || r.status === 'OUT_OF_ORDER' || r.status === 'BLOCKED'
  ).length;

  const activeBookings = hotelReservations.filter(
    r => r.status !== 'CANCELLED' && r.status !== 'CHECKED_OUT'
  );
  const cancelledBookings = hotelReservations.filter(r => r.status === 'CANCELLED');
  const totalRevenue = hotelReservations
    .filter(r => r.status !== 'CANCELLED')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Group rooms by category for category breakdown
  const categorySummaryMap = new Map();
  hotelRoomTypes.forEach(rt => {
    const key = String(rt.name || 'Standard Room').trim().toLowerCase();
    categorySummaryMap.set(key, {
      name: rt.name || 'Standard Room',
      basePrice: Number(rt.base_price) || 2500,
      bed: rt.bedding_type || 'King Bed',
      total: 0,
      available: 0,
      occupied: 0,
      roomNumbers: []
    });
  });

  hotelRooms.forEach(rm => {
    const catName = String(rm.type || 'Standard Room').trim();
    const key = catName.toLowerCase();
    if (!categorySummaryMap.has(key)) {
      categorySummaryMap.set(key, {
        name: catName,
        basePrice: Number(rm.price) || 2500,
        bed: rm.bed || 'King Bed',
        total: 0,
        available: 0,
        occupied: 0,
        roomNumbers: []
      });
    }
    const entry = categorySummaryMap.get(key);
    entry.total += 1;
    if (rm.status === 'OCCUPIED') entry.occupied += 1;
    else if (rm.status !== 'MAINTENANCE' && rm.status !== 'BLOCKED') entry.available += 1;
    entry.roomNumbers.push(rm.room_number);
  });

  const categoryBreakdown = Array.from(categorySummaryMap.values());

  const handleSaveLimit = async (e) => {
    e.preventDefault();
    await updateHotelRoomLimit(h.id, customLimit);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setSelectedInsightHotelId(null)}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-black text-white">{h.name}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-indigo-300 border border-slate-700">
                  ID: {h.slug}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    h.status === 'ACTIVE'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${h.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {h.status === 'ACTIVE' ? 'LOGIN ACTIVE' : 'SUSPENDED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete Admin Insights &bull; Assigned Room Quota &bull; Created Rooms &bull; SuperAdmin Room Deletion Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedInsightHotelId(null);
                setEditingHotel(h);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Admin & Rooms</span>
            </button>

            <button
              type="button"
              onClick={() => toggleHotelStatus(h.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                h.status === 'ACTIVE'
                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{h.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedInsightHotelId(null)}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Insights Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* 1. ROOM QUOTA & CREATION INSIGHTS BANNER */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950 border border-indigo-500/30 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4" />
                  <span>SuperAdmin Room Allocation & Creation Quota</span>
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  {createdRoomsCount} of {assignedRoomsLimit} Assigned Rooms Created by Admin
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isLimitReached
                    ? 'Room creation limit has been reached! Admin cannot create more rooms unless SuperAdmin increases the limit below.'
                    : `Admin can still create ${remainingRoomsQuota} more room${remainingRoomsQuota === 1 ? '' : 's'} before reaching the limit.`}
                </p>
              </div>

              {/* Quick Update Assigned Room Limit Form */}
              <form onSubmit={handleSaveLimit} className="flex items-center gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <label className="text-slate-300 font-bold text-[11px] whitespace-nowrap">
                  Assigned Limit:
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={customLimit}
                  onChange={(e) => setCustomLimit(e.target.value)}
                  className="w-20 px-2.5 py-1.5 bg-slate-950 border border-indigo-500/50 rounded-lg text-emerald-300 font-mono font-bold text-center"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Limit</span>
                </button>
              </form>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-300">
                  Quota Usage: <span className="font-mono text-white">{usagePercent}%</span>
                </span>
                <span className={isLimitReached ? 'text-amber-400 font-mono' : 'text-emerald-400 font-mono'}>
                  {isLimitReached
                    ? `LIMIT REACHED (${createdRoomsCount}/${assignedRoomsLimit})`
                    : `${remainingRoomsQuota} ROOMS REMAINING`}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isLimitReached
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>

            {/* 6 Key Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Assigned by SuperAdmin</span>
                <span className="text-xl font-black text-indigo-400 font-mono mt-1 block">{assignedRoomsLimit}</span>
                <span className="text-[10px] text-slate-500">Max Allowed Rooms</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Created by Admin</span>
                <span className="text-xl font-black text-white font-mono mt-1 block">{createdRoomsCount}</span>
                <span className="text-[10px] text-slate-500">Active in Inventory</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Remaining Can Create</span>
                <span className={`text-xl font-black font-mono mt-1 block ${remainingRoomsQuota === 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {remainingRoomsQuota}
                </span>
                <span className="text-[10px] text-slate-500">
                  {remainingRoomsQuota === 0 ? 'Limit Reached' : 'Available Quota'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Vacant / Occupied</span>
                <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                  {vacantRoomsCount} <span className="text-slate-500 text-sm">/</span> <span className="text-rose-400">{occupiedRoomsCount}</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  {dirtyRoomsCount} Dirty &bull; {maintenanceRoomsCount} Maint.
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Bookings</span>
                <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">{hotelReservations.length}</span>
                <span className="text-[10px] text-slate-500">
                  {activeBookings.length} Active &bull; {cancelledBookings.length} Cancelled
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Gross Revenue</span>
                <span className="text-xl font-black text-amber-400 font-mono mt-1 block">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">From Confirmed Stays</span>
              </div>
            </div>
          </div>

          {/* 2. COMPLETE ADMIN CREDENTIALS, OWNER & PROPERTY PROFILE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Credentials & Access Card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Admin Login Credentials & Access</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(`Email: ${h.email} | Password: ${h.password}`);
                    showNotification(`Copied credentials for ${h.email}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Credentials</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Admin Login Email</span>
                  <div className="font-mono font-bold text-white mt-1 flex items-center gap-1.5 break-all">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{h.email}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Admin Password</span>
                  <div className="font-mono font-bold text-amber-300 mt-1 flex items-center justify-between">
                    <span>{showPassword ? h.password : '••••••••••'}</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Subscription Plan</span>
                  <span className="font-bold text-white mt-1 block">{h.plan || 'Enterprise'} ({h.commissionRate || 10}% Comm.)</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Provisioned On</span>
                  <span className="font-mono text-slate-200 mt-1 block">
                    {h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Property & Owner Details Card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Owner & Property Location Details</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">Code: {h.shortName || 'HTL'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Owner / Manager Name</span>
                  <span className="font-bold text-white mt-1 block">{h.ownerName || 'Property Admin'}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Mobile</span>
                  <span className="font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{h.mobile || 'Not set'}</span>
                  </span>
                </div>

                <div className="col-span-2 p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Full Property Address & City</span>
                  <span className="text-slate-200 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{h.address || 'India'} ({h.city || 'Bengaluru'})</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. OPERATIONAL ACTIVITY COUNTS (F&B, CABS, HOUSEKEEPING, INVOICES) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Room Categories</span>
                <span className="text-lg font-black text-white font-mono">{categoryBreakdown.length}</span>
              </div>
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">F&B POS Orders</span>
                <span className="text-lg font-black text-white font-mono">{hotelFnb.length}</span>
              </div>
              <Utensils className="w-5 h-5 text-amber-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Cab Bookings</span>
                <span className="text-lg font-black text-white font-mono">{hotelCabs.length}</span>
              </div>
              <Car className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Folios & Invoices</span>
                <span className="text-lg font-black text-white font-mono">{hotelInvoices.length}</span>
              </div>
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* 4. ROOM CATEGORIES SUMMARY */}
          {categoryBreakdown.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Room Categories Breakdown ({categoryBreakdown.length} Categories)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">{cat.name}</div>
                        <div className="text-[11px] text-slate-400">{cat.bed}</div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 text-xs">
                        ₹{cat.basePrice.toLocaleString('en-IN')}/nt
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-300 font-semibold">
                        Created: <strong className="text-white font-mono">{cat.total} Rooms</strong>
                      </span>
                      <span className="text-emerald-400 font-mono">
                        {cat.available} Avail &bull; {cat.occupied} Occ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. CREATED ROOMS INVENTORY TABLE (WITH SUPERADMIN DELETE ROOM CONTROL) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-emerald-400" />
                <span>
                  Created Physical Rooms Directory ({createdRoomsCount} of {assignedRoomsLimit} Assigned)
                </span>
              </h4>
              <span className="text-[11px] text-rose-400 font-semibold">
                Room deletion is restricted to SuperAdmin only
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
              {hotelRooms.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No rooms have been created for this property yet. Assigned limit is <strong className="text-white">{assignedRoomsLimit} rooms</strong>.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                      <tr>
                        <th className="py-3 px-4">Room #</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Floor & Bed</th>
                        <th className="py-3 px-4">Tariff / Night</th>
                        <th className="py-3 px-4">Live Status</th>
                        <th className="py-3 px-4">Current Guest</th>
                        <th className="py-3 px-4 text-right">SuperAdmin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {hotelRooms.map((rm) => (
                        <tr key={rm.id || rm.room_number} className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 font-mono font-bold text-white">#{rm.room_number}</td>
                          <td className="py-3 px-4 text-slate-200 font-semibold">{rm.type || 'Standard Room'}</td>
                          <td className="py-3 px-4 text-slate-400">{rm.floor || 'Floor 1'} &bull; {rm.bed || 'King Bed'}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">₹{Number(rm.price || 2500).toLocaleString('en-IN')}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rm.status === 'OCCUPIED'
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : rm.status === 'DIRTY'
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {rm.status || 'VACANT_READY'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {rm.guest ? (
                              <span className="font-semibold text-white">{rm.guest}</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {confirmDeleteRoomObj?.room_number === rm.room_number ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteRoom(rm.id, rm.room_number, hotel.id);
                                    setConfirmDeleteRoomObj(null);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] cursor-pointer"
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteRoomObj(null)}
                                  className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteRoomObj(rm)}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold text-[11px] inline-flex items-center gap-1 transition cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete Room</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 6. RECENT BOOKINGS & RESERVATIONS FOR THIS ADMIN */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-cyan-400" />
              <span>Property Reservations & Guest Bookings ({hotelReservations.length})</span>
            </h4>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
              {hotelReservations.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  No reservations recorded for this property yet.
                </div>
              ) : (
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 border-b border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                      <tr>
                        <th className="py-2.5 px-4">Booking ID</th>
                        <th className="py-2.5 px-4">Guest</th>
                        <th className="py-2.5 px-4">Room</th>
                        <th className="py-2.5 px-4">Check-In / Out</th>
                        <th className="py-2.5 px-4">Amount</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {hotelReservations.slice(0, 15).map((res) => (
                        <tr key={res.id} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-4 font-mono font-bold text-indigo-300">{res.id}</td>
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-white">{res.guest}</div>
                            <div className="text-[10px] text-slate-500">{res.guest_phone || res.guest_email || ''}</div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-300">{res.room || res.room_number}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-400">
                            {res.check_in} &rarr; {res.check_out}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-emerald-400">
                            ₹{Number(res.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200">
                              {res.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
