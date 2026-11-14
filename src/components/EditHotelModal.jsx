import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { X, Save, KeyRound, Mail, Sparkles } from 'lucide-react';

export default function EditHotelModal() {
  const { editingHotel, setEditingHotel, updateHotel } = useSuperAdmin();

  if (!editingHotel) return null;

  const [name, setName] = useState(editingHotel.name || '');
  const [slug, setSlug] = useState(editingHotel.slug || '');
  const [ownerName, setOwnerName] = useState(editingHotel.ownerName || '');
  const [email, setEmail] = useState(editingHotel.email || '');
  const [password, setPassword] = useState(editingHotel.password || '');
  const [mobile, setMobile] = useState(editingHotel.mobile || '');
  const [address, setAddress] = useState(editingHotel.address || '');
  const [city, setCity] = useState(editingHotel.city || '');
  const [totalRooms, setTotalRooms] = useState(editingHotel.totalRooms || 20);
  const [logoUrl, setLogoUrl] = useState(editingHotel.logoUrl || '');
  const [plan, setPlan] = useState(editingHotel.plan || 'Enterprise');
  const [status, setStatus] = useState(editingHotel.status || 'ACTIVE');
  const [commissionRate, setCommissionRate] = useState(editingHotel.commissionRate || 10);
  const [error, setError] = useState('');

  const generateNewPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim() || password.trim().length < 6) {
      setError('Valid Admin Email and Password (minimum 6 characters) are required.');
      return;
    }

    const res = await updateHotel({
      ...editingHotel,
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      ownerName: ownerName.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      city: city.trim(),
      totalRooms: Number(totalRooms) || 20,
      logoUrl: logoUrl.trim(),
      plan,
      status,
      commissionRate: Number(commissionRate) || 10
    });

    if (res && res.success === false) {
      setError(res.message || 'Failed to update credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Edit Admin Login Credentials</h3>
              <p className="text-xs text-slate-400">ID: {editingHotel.id}</p>
            </div>
          </div>
          <button
            onClick={() => setEditingHotel(null)}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-semibold">
              {error}
            </div>
          )}

          <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-slate-300 font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
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

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setEditingHotel(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Credentials</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
