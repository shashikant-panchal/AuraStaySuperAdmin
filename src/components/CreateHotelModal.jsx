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
  ShieldCheck
} from 'lucide-react';

export default function CreateHotelModal() {
  const { isCreateHotelModalOpen, setIsCreateHotelModalOpen, addHotel } = useSuperAdmin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [address, setAddress] = useState('');
  const [totalRooms, setTotalRooms] = useState('15');
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
    if (!email && autoSlug) {
      setEmail(`admin@${autoSlug}.com`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanName = name.trim() || 'Shivanandi Vista';
    const cleanSlug = (slug.trim() || cleanName).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');

    if (!cleanEmail) {
      setError('Admin Login Email / Username is required.');
      return;
    }

    if (cleanEmail.length < 4) {
      setError('Admin Login Email / Username must be at least 4 characters.');
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
        ownerName: ownerName.trim() || `${cleanName} Admin`,
        email: cleanEmail,
        password: cleanPass,
        mobile: mobile.trim() || '+91 98765 43210',
        address: address.trim() || `${city || 'Bengaluru'}, India`,
        city: city.trim() || 'Bengaluru',
        totalRooms: Number(totalRooms) || 15,
        logoUrl: '',
        plan: 'Enterprise',
        commissionRate: 10,
        currency: 'INR',
        currencySymbol: '₹',
        status: 'ACTIVE'
      });

      if (result && result.success === false) {
        setError(result.message || 'Could not create Admin credential.');
        return;
      }

      setName('');
      setSlug('');
      setOwnerName('');
      setEmail('');
      setPassword('');
      setError('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Hotel Admin Login Credentials</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Only credentials created here can sign in to the Hotel Admin PMS
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-semibold">
              {error}
            </div>
          )}

          {/* 1. Admin Credentials (Primary Section) */}
          <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-3.5">
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Step 1: Admin Login Credentials *</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Saved to Supabase</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* 2. Property Details */}
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Step 2: Property Details</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-slate-300 font-semibold mb-1">
                  Property ID / Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. shivanandi-vista"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Admin / Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g. Property Manager"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">City</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
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
              <span>{isSaving ? 'Saving to Supabase...' : 'Create Admin Credentials'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
