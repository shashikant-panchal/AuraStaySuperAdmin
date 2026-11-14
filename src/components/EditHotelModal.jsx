import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { X, Save, KeyRound, Mail, Sparkles, BedDouble, Plus, Trash2, Building2 } from 'lucide-react';

export default function EditHotelModal() {
  const { editingHotel, setEditingHotel, updateHotel, globalRooms, deleteRoom } = useSuperAdmin();

  if (!editingHotel) return null;

  const existingHotelRooms = (globalRooms || []).filter(r => r.hotel_id === editingHotel.id);

  const [name, setName] = useState(editingHotel.name || '');
  const [slug, setSlug] = useState(editingHotel.slug || '');
  const [shortName, setShortName] = useState(editingHotel.shortName || '');
  const [ownerName, setOwnerName] = useState(editingHotel.ownerName || '');
  const [email, setEmail] = useState(editingHotel.email || '');
  const [password, setPassword] = useState(editingHotel.password || '');
  const [mobile, setMobile] = useState(editingHotel.mobile || '');
  const [address, setAddress] = useState(editingHotel.address || '');
  const [city, setCity] = useState(editingHotel.city || '');
  const [totalRooms, setTotalRooms] = useState(
    existingHotelRooms.length > 0 ? existingHotelRooms.length : (editingHotel.totalRooms || 0)
  );
  const [logoUrl, setLogoUrl] = useState(editingHotel.logoUrl || '');
  const [plan, setPlan] = useState(editingHotel.plan || 'Enterprise');
  const [status, setStatus] = useState(editingHotel.status || 'ACTIVE');
  const [commissionRate, setCommissionRate] = useState(editingHotel.commissionRate || 10);
  const [newRoomCategories, setNewRoomCategories] = useState([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const generateNewPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const addNewCategoryRow = () => {
    const startBase = (existingHotelRooms.length + newRoomCategories.length + 1) * 100 + 1;
    setNewRoomCategories(prev => [
      ...prev,
      {
        name: 'Standard Room',
        count: 2,
        startRoomNumber: startBase,
        price: 2500,
        bed: 'King Bed',
        floor: 'Floor 1'
      }
    ]);
  };

  const updateNewCategoryRow = (index, field, value) => {
    setNewRoomCategories(prev =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const removeNewCategoryRow = (index) => {
    setNewRoomCategories(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || password.trim().length < 6) {
      setError('Valid Admin Email and Password (minimum 6 characters) are required.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateHotel({
        ...editingHotel,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        shortName: shortName.trim().toUpperCase(),
        ownerName: ownerName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        mobile: mobile.trim(),
        address: address.trim(),
        city: city.trim(),
        totalRooms: Number(totalRooms) || 0,
        logoUrl: logoUrl.trim(),
        plan,
        status,
        commissionRate: Number(commissionRate) || 10,
        newRoomCategories
      });

      if (res && res.success === false) {
        setError(res.message || 'Failed to update credentials.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Admin Credentials, Property Details & Rooms</h3>
              <p className="text-xs text-slate-400">Property ID: {editingHotel.id}</p>
            </div>
          </div>
          <button
            onClick={() => setEditingHotel(null)}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-semibold">
              {error}
            </div>
          )}

          {/* Credentials */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Admin Login Email / Username *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-semibold">Admin Password * (min 6 chars)</label>
                <button
                  type="button"
                  onClick={generateNewPassword}
                  className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Login Access Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ACTIVE">ACTIVE (Can Log In)</option>
                <option value="SUSPENDED">SUSPENDED (Blocked)</option>
              </select>
            </div>
          </div>

          {/* Property Details */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3.5">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Property & Owner Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Property Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Property ID / Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Admin / Owner Name</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Mobile</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Full Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Rooms Capacity</label>
                <input
                  type="number"
                  min="0"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Existing & Add Rooms Section */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <BedDouble className="w-4 h-4" />
                <span>Property Rooms Inventory ({existingHotelRooms.length} Active Rooms)</span>
              </div>
              <button
                type="button"
                onClick={addNewCategoryRow}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add More Rooms</span>
              </button>
            </div>

            {existingHotelRooms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {existingHotelRooms.map(rm => (
                  <div
                    key={rm.id || rm.room_number}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-[11px]"
                  >
                    <span className="font-mono font-bold text-white">#{rm.room_number}</span>
                    <span className="text-slate-400">{rm.type}</span>
                    <span className="text-emerald-400 font-mono">₹{rm.price}</span>
                    <button
                      type="button"
                      onClick={() => deleteRoom(rm.id, rm.room_number)}
                      className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                      title="Delete room"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newRoomCategories.map((cat, idx) => (
              <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Room Category *</label>
                  <input
                    type="text"
                    required
                    value={cat.name}
                    onChange={(e) => updateNewCategoryRow(idx, 'name', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-emerald-400 uppercase font-bold mb-1">How Many *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cat.count}
                    onChange={(e) => updateNewCategoryRow(idx, 'count', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-emerald-500/50 rounded-lg text-emerald-300 font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Tariff (₹)</label>
                  <input
                    type="number"
                    min="100"
                    value={cat.price}
                    onChange={(e) => updateNewCategoryRow(idx, 'price', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Start Room #</label>
                  <input
                    type="number"
                    min="1"
                    value={cat.startRoomNumber}
                    onChange={(e) => updateNewCategoryRow(idx, 'startRoomNumber', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeNewCategoryRow(idx)}
                    className="w-full py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-[11px] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => setEditingHotel(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Credentials & Rooms'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
