import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import {
  X,
  Building2,
  Plus,
  KeyRound,
  Mail,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  BedDouble,
  Trash2,
  MapPin,
  Phone,
  User
} from 'lucide-react';

export default function CreateHotelModal() {
  const { isCreateHotelModalOpen, setIsCreateHotelModalOpen, addHotel } = useSuperAdmin();

  // Step 1: Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [status, setStatus] = useState('ACTIVE');

  // Step 2: Property & Owner Details
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortName, setShortName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [plan, setPlan] = useState('Enterprise');
  const [commissionRate, setCommissionRate] = useState('10');
  const [manualTotalRooms, setManualTotalRooms] = useState('10');

  // Step 3: Optional Initial Room Categories to Pre-Create
  const [roomCategories, setRoomCategories] = useState([]);

  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isCreateHotelModalOpen) return null;

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
  };

  const handleNameChange = (val) => {
    setName(val);
    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setSlug(autoSlug);
    const autoShort = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
    setShortName(autoShort);
    if (!email && autoSlug) {
      setEmail(`admin@${autoSlug}.com`);
    }
  };

  const addCategoryRow = () => {
    const nextFloorNum = roomCategories.length + 1;
    setRoomCategories(prev => [
      ...prev,
      {
        name: nextFloorNum === 2 ? 'Deluxe Room' : `Executive Suite`,
        count: 2,
        startRoomNumber: nextFloorNum * 100 + 1,
        roomNumbers: '',
        price: nextFloorNum === 2 ? 3500 : 4500,
        bed: 'King Bed',
        floor: `Floor ${nextFloorNum}`,
        areaSqft: 380,
        maxAdults: 3
      }
    ]);
  };

  const updateCategoryRow = (index, field, value) => {
    setRoomCategories(prev =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const removeCategoryRow = (index) => {
    setRoomCategories(prev => prev.filter((_, idx) => idx !== index));
  };

  const totalConfiguredRooms = roomCategories.reduce(
    (sum, c) => sum + Math.max(0, Number(c.count) || 0),
    0
  );

  const effectiveTotalRooms = Math.max(
    Math.max(1, Number(manualTotalRooms) || 0),
    totalConfiguredRooms
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanName = name.trim();
    const cleanSlug = (slug.trim() || cleanName)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!cleanEmail || cleanEmail.length < 4) {
      setError('Valid Admin Login Email / Username is required.');
      return;
    }

    if (!cleanPass || cleanPass.length < 6) {
      setError('Admin Login Password must be at least 6 characters long.');
      return;
    }

    if (!cleanName || !cleanSlug) {
      setError('Property Name and Property ID / Slug are required.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await addHotel({
        name: cleanName,
        slug: cleanSlug,
        shortName: shortName.trim().toUpperCase() || cleanName.slice(0, 4).toUpperCase(),
        ownerName: ownerName.trim() || `${cleanName} Admin`,
        email: cleanEmail,
        password: cleanPass,
        mobile: mobile.trim() || '+91 98765 43210',
        address: address.trim() || `${city || 'Bengaluru'}, India`,
        city: city.trim() || 'Bengaluru',
        totalRooms: effectiveTotalRooms,
        roomCategories: roomCategories.filter(c => String(c.name || '').trim() && Number(c.count) > 0),
        logoUrl: logoUrl.trim(),
        plan,
        commissionRate: Number(commissionRate) || 10,
        currency: 'INR',
        currencySymbol: '₹',
        status
      });

      if (result && result.success === false) {
        setError(result.message || 'Could not create Admin credential.');
        return;
      }

      setName('');
      setSlug('');
      setShortName('');
      setOwnerName('');
      setMobile('');
      setAddress('');
      setEmail('');
      setPassword('');
      setError('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Create Hotel Admin Credentials, Property Details & Rooms
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure Admin login, property information, and initial room categories & room counts in Supabase
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateHotelModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1: ADMIN LOGIN CREDENTIALS */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-3.5">
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Step 1: Admin Login Credentials *</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Strictly Validated on Admin Login</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-200 font-semibold mb-1">Admin Login Email / Username *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin@shivanandi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-200 font-semibold">Admin Password * (min 6 chars)</label>
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Enter strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1">Login Access Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                >
                  <option value="ACTIVE">ACTIVE (Can Log In)</option>
                  <option value="SUSPENDED">SUSPENDED (Blocked)</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: PROPERTY & OWNER DETAILS */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3.5">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Step 2: Property & Admin Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Property / Hotel Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shivanandi Vista"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Property ID / Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. shivanandi-vista"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. SVH"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Admin / Owner Full Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Sharma"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 12345"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">City *</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Full Property Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. No.15, RD Greenwoods, I Phase, Begur, BK Halli Post, Near Bengaluru Airport"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subscription Plan</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Enterprise">Enterprise PMS</option>
                  <option value="Pro">Pro Suite</option>
                  <option value="Starter">Starter</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: ROOM QUOTA & OPTIONAL INITIAL ROOMS SETUP */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4" />
                  <span>Step 3: Assigned Room Limit & Initial Rooms Setup *</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Set how many total rooms this Admin is allowed to create. Admin cannot exceed this limit or delete rooms.
                </p>
              </div>

              <button
                type="button"
                onClick={addCategoryRow}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pre-Create Initial Room Type (Optional)</span>
              </button>
            </div>

            {/* Assigned Room Limit Box */}
            <div className="p-3.5 bg-slate-950/90 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="text-white font-bold text-xs block">
                  Assigned Room Creation Limit (Max Rooms Admin Can Create) *
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  If the Admin tries to create more than <strong className="text-emerald-400 font-mono">{effectiveTotalRooms}</strong> rooms, the system will block creation and display: <em>&ldquo;Your room creation limit has reached, contact SuperAdmin&rdquo;</em>.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={manualTotalRooms}
                  onChange={(e) => setManualTotalRooms(e.target.value)}
                  className="w-28 px-3.5 py-2 bg-slate-900 border-2 border-emerald-500/60 rounded-xl text-emerald-300 font-mono font-black text-base text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Rooms Limit</span>
              </div>
            </div>

            {roomCategories.length > 0 && (
              <div className="space-y-3">
                {roomCategories.map((cat, idx) => {
                  const qty = Math.max(0, Number(cat.count) || 0);
                  const startNo = Number(cat.startRoomNumber) || ((idx + 1) * 100 + 1);
                  const previewNums = Array.from({ length: Math.min(qty, 6) }, (_, i) => startNo + i).join(', ');

                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <span className="text-[11px] font-bold text-white flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                            Category #{idx + 1}
                          </span>
                          <span>{cat.name || 'Room Category'}</span>
                          <span className="text-emerald-400 font-mono">
                            ({qty} {qty === 1 ? 'Room' : 'Rooms'} Available on User Side)
                          </span>
                        </span>

                        <button
                          type="button"
                          onClick={() => removeCategoryRow(idx)}
                          className="text-slate-500 hover:text-rose-400 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                            Room Category Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Standard Room"
                            value={cat.name}
                            onChange={(e) => updateCategoryRow(idx, 'name', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-emerald-400 uppercase font-bold mb-1">
                            How Many Rooms *
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            required
                            value={cat.count}
                            onChange={(e) => updateCategoryRow(idx, 'count', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-emerald-500/50 rounded-lg text-emerald-300 font-mono font-bold text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                            Tariff / Night (₹) *
                          </label>
                          <input
                            type="number"
                            min="100"
                            required
                            value={cat.price}
                            onChange={(e) => updateCategoryRow(idx, 'price', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                            Bedding Type
                          </label>
                          <select
                            value={cat.bed}
                            onChange={(e) => updateCategoryRow(idx, 'bed', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                          >
                            <option value="King Bed">King Bed</option>
                            <option value="Queen Bed">Queen Bed</option>
                            <option value="Twin Bed">Twin Bed</option>
                            <option value="Double Bed">Double Bed</option>
                            <option value="Suite">Suite</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                            Start Room # (Admin)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={cat.startRoomNumber}
                            onChange={(e) => updateCategoryRow(idx, 'startRoomNumber', e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 font-mono"
                          />
                        </div>
                      </div>

                      {qty > 0 && (
                        <div className="text-[10.5px] text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span>
                            Admin PMS Room Numbers: <strong className="text-slate-200 font-mono">#{previewNums}{qty > 6 ? '...' : ''}</strong>
                          </span>
                          <span>
                            User Website Card: <strong className="text-emerald-400">{cat.name || 'Standard Room'} &bull; {qty} Available</strong> (room numbers hidden)
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateHotelModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {isSaving
                  ? 'Provisioning in Supabase...'
                  : `Create Admin (Limit: ${effectiveTotalRooms} Room${effectiveTotalRooms === 1 ? '' : 's'})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
