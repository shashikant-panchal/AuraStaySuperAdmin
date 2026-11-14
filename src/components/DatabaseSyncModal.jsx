import React, { useState } from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { X, Database, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

const SQL_SCRIPT = `-- Aavasa Multi-Tenant SaaS Master Database Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Hotels / Tenants Table
CREATE TABLE IF NOT EXISTS hotels (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT DEFAULT 'HTL',
    logo_url TEXT DEFAULT '',
    owner_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    mobile TEXT DEFAULT '',
    address TEXT DEFAULT 'India',
    city TEXT DEFAULT 'Bengaluru',
    total_rooms INT DEFAULT 20,
    currency TEXT DEFAULT 'INR',
    currency_symbol TEXT DEFAULT '₹',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
    plan TEXT NOT NULL DEFAULT 'Enterprise',
    commission_rate NUMERIC(5, 2) DEFAULT 10.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add hotel_id to rooms & reservations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'hotel_id') THEN
        ALTER TABLE rooms ADD COLUMN hotel_id TEXT DEFAULT 'shivanandi';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'hotel_id') THEN
        ALTER TABLE reservations ADD COLUMN hotel_id TEXT DEFAULT 'shivanandi';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fnb_orders' AND column_name = 'hotel_id') THEN
        ALTER TABLE fnb_orders ADD COLUMN hotel_id TEXT DEFAULT 'shivanandi';
    END IF;
END $$;

-- 3. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE hotels;
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE reservations;

-- 4. Disable RLS so SuperAdmin, Hotel Admin, and Guest Booking sync seamlessly
ALTER TABLE IF EXISTS hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reservations DISABLE ROW LEVEL SECURITY;

-- 5. Clean Slate: No seed hotels or default Admin credentials.
-- Create Hotel Admin credentials directly in the Aavasa SuperAdmin portal.`;

export default function DatabaseSyncModal() {
  const { isSqlModalOpen, setIsSqlModalOpen, showNotification } = useSuperAdmin();
  const [copied, setCopied] = useState(false);

  if (!isSqlModalOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    showNotification('SQL Migration copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Multi-Tenant Database Schema</h3>
              <p className="text-xs text-slate-400">Database Schema Migration</p>
            </div>
          </div>
          <button
            onClick={() => setIsSqlModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Run this migration in your SQL Editor to create the <code className="text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded">hotels</code> table, link <code className="text-indigo-400 bg-slate-950 px-1.5 py-0.5 rounded">hotel_id</code> across rooms & reservations, and enable realtime synchronization.
          </p>

          <div className="relative">
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-72">
              {SQL_SCRIPT}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Realtime Cloud Database: Connected</span>
            </div>
            <button
              onClick={() => setIsSqlModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

