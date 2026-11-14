import React from 'react';
import { useSuperAdmin } from '../context/SuperAdminContext';
import { 
  Building2, 
  CalendarCheck, 
  BedDouble, 
  IndianRupee, 
  TrendingUp, 
  CheckCircle2,
  Users
} from 'lucide-react';

export default function MetricCards() {
  const { metrics } = useSuperAdmin();

  const cards = [
    {
      label: 'Registered Hotels',
      value: metrics.totalHotels,
      subtext: `${metrics.activeHotels} Active SaaS Tenants`,
      icon: Building2,
      color: 'from-indigo-500/20 to-indigo-500/5',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20'
    },
    {
      label: 'Created / Assigned Rooms',
      value: `${metrics.totalRooms} / ${metrics.totalAssignedRooms || 0}`,
      subtext: `${metrics.totalRooms} created by Admins of ${metrics.totalAssignedRooms || 0} assigned`,
      icon: BedDouble,
      color: 'from-cyan-500/20 to-cyan-500/5',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20'
    },
    {
      label: 'Platform Bookings',
      value: metrics.totalBookings,
      subtext: `${metrics.confirmedBookings} Confirmed Stays`,
      icon: CalendarCheck,
      color: 'from-emerald-500/20 to-emerald-500/5',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    {
      label: 'Gross Booking Volume',
      value: `₹${metrics.totalGrossRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtext: 'Cumulative guest stay transactions',
      icon: IndianRupee,
      color: 'from-amber-500/20 to-amber-500/5',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-5 rounded-2xl bg-gradient-to-b ${c.color} bg-slate-900 border ${c.borderColor} relative overflow-hidden`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{c.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center ${c.textColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">{c.value}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>{c.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

