import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { 
  X, 
  Building2, 
  Plus, 
  KeyRound, 
  Mail, 
  MapPin, 
  Phone, 
  BedDouble, 
  Image, 
  Sparkles,
  Percent
} from 'lucide-react';

const SAMPLE_LOGOS = [
  { name: 'Luxury Royal', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80' },
  { name: 'Boutique Villa', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=80' },
  { name: 'Modern Palace', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=200&q=80' },
  { name: 'Seaside Resort', url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=200&q=80' }
];

export default function CreateHotelModal() {
  const { isCreateHotelModalOpen, setIsCreateHotelModalOpen, addHotel } = useSuperAdmin();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [totalRooms, setTotalRooms] = useState('20');
  const [logoUrl, setLogoUrl] = useState(SAMPLE_LOGOS[0].url);
  const [plan, setPlan] = useState('Enterprise');
  const [commissionRate, setCommissionRate] = useState('10');
  const [error, setError] = useState('');

  if (!isCreateHotelModalOpen) return null;

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  // Auto-generate slug and email preview
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
    if (!name.trim() || !slug.trim() || !email.trim() || !password.trim()) {
      setError('Hotel Name, Slug, Admin Email and Password are required.');
      return;
    }

    await addHotel({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      ownerName: ownerName.trim() || `${name.trim()} Admin`,
      email: email.trim().toLowerCase(),
      password: password.trim(),
      mobile: mobile.trim() || '+91 98765 43210',
      address: address.trim() || `${city || 'City Center'}, India`,
      city: city.trim() || 'Bengaluru',
      totalRooms: Number(totalRooms) || 20,
      logoUrl: logoUrl.trim(),
      plan,
      commissionRate: Number(commissionRate) || 10,
      currency: 'INR',
      currencySymbol: '₹',
      status: 'ACTIVE'
    });
    setName('');
    setSlug('');
    setOwnerName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register New Hotel Tenant</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Creates hotel profile, admin login credentials, and public booking portal
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateHotelModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
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

          {/* Hotel Name & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hotel Property Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Orchid Grand"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Hotel Slug / ID * <span className="text-slate-500 font-normal">(Used in URL)</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. royal-orchid-grand"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Admin Credentials (Email & Password) */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-2xl space-y-3">
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Hotel Admin Login Credentials</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Admin Login Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@hotel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">Admin Login Password *</label>
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Password</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter custom admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Owner / Manager & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Owner / GM Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Sen"
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
              <label className="block text-slate-300 font-semibold mb-1">City / Region</label>
              <input
                type="text"
                placeholder="e.g. Mumbai / Goa"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Address & Total Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Full Hotel Address</label>
              <input
                type="text"
                placeholder="e.g. Marine Drive, Nariman Point, Mumbai - 400021"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Room Capacity</label>
              <input
                type="number"
                min="1"
                value={totalRooms}
                onChange={(e) => setTotalRooms(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Logo URL with sample picker */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Hotel Logo / Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px]"
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-slate-500">Quick presets:</span>
              {SAMPLE_LOGOS.map((l, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setLogoUrl(l.url)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition ${
                    logoUrl === l.url 
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          {/* Plan & Commission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Subscription Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Starter">Starter (Up to 10 Rooms)</option>
                <option value="Professional">Professional (Up to 50 Rooms)</option>
                <option value="Enterprise">Enterprise (Unlimited Rooms & Multi-Property)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Platform Commission Rate (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCreateHotelModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Hotel Tenant</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

