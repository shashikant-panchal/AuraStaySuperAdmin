import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SuperAdminContext = createContext(null);

const DEFAULT_SUPER_ADMIN = {
  id: 'sa_01',
  name: 'Platform Super Admin',
  email: 'superadmin@aurastay.com',
  role: 'PLATFORM_OWNER'
};

const INITIAL_HOTELS = [
  {
    id: 'hotel_aurastay_01',
    slug: 'aurastay-suite',
    name: 'AuraStay Suite',
    shortName: 'AST',
    logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80',
    ownerName: 'AuraStay Admin',
    email: 'admin@aurastay.com',
    password: 'admin123',
    mobile: '7978578046',
    address: 'DLF Cyber City, Patia, Bhubaneswar, Odisha, India',
    city: 'Bhubaneswar',
    totalRooms: 28,
    currency: 'INR',
    currencySymbol: '₹',
    status: 'ACTIVE',
    plan: 'Enterprise',
    commissionRate: 10,
    createdAt: '2026-11-01T10:00:00Z'
  }
];

export function SuperAdminProvider({ children }) {
  // 1. Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('aurastay_superadmin_auth') === 'true';
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const saved = localStorage.getItem('aurastay_superadmin_user');
    return saved ? JSON.parse(saved) : DEFAULT_SUPER_ADMIN;
  });

  // 2. Tenants State
  const [hotels, setHotels] = useState(() => {
    try {
      const saved = localStorage.getItem('aurastay_saas_hotels');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load hotels from storage', e);
    }
    return INITIAL_HOTELS;
  });

  // 3. Global Platform Data
  const [globalRooms, setGlobalRooms] = useState([]);
  const [globalReservations, setGlobalReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('hotels'); // 'overview' | 'hotels' | 'bookings' | 'rooms' | 'sql'
  const [notification, setNotification] = useState(null);
  const [isCreateHotelModalOpen, setIsCreateHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Sync hotels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aurastay_saas_hotels', JSON.stringify(hotels));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [hotels]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 4. Fetch Supabase Data
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let isMounted = true;

    async function loadData() {
      try {
        // Fetch hotels
        const { data: hotelsData, error: hotelsErr } = await supabase.from('hotels').select('*').order('created_at', { ascending: false });
        if (!hotelsErr && hotelsData && hotelsData.length > 0 && isMounted) {
          setHotels(hotelsData.map(h => ({
            id: h.id,
            slug: h.slug,
            name: h.name,
            shortName: h.short_name || 'AST',
            logoUrl: h.logo_url || '',
            ownerName: h.owner_name,
            email: h.email,
            password: h.password,
            mobile: h.mobile,
            address: h.address,
            city: h.city,
            totalRooms: h.total_rooms || 20,
            currency: h.currency || 'INR',
            currencySymbol: h.currency_symbol || '₹',
            status: h.status || 'ACTIVE',
            plan: h.plan || 'Enterprise',
            commissionRate: h.commission_rate || 10,
            createdAt: h.created_at
          })));
        }

        // Fetch rooms
        const { data: roomsData } = await supabase.from('rooms').select('*');
        if (roomsData && isMounted) {
          setGlobalRooms(roomsData);
        }

        // Fetch reservations
        const { data: resData } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
        if (resData && isMounted) {
          setGlobalReservations(resData);
        }
      } catch (err) {
        console.warn('Super Admin Supabase load error:', err);
      }
    }

    loadData();

    // Setup Realtime subscriptions
    const channel = supabase.channel('superadmin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => loadData())
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // 5. Authentication Actions
  const login = (email, password) => {
    if (
      (email === 'superadmin@aurastay.com' && password === 'super123') ||
      (email.toLowerCase().includes('admin') && password.length >= 4)
    ) {
      const user = {
        ...DEFAULT_SUPER_ADMIN,
        email
      };
      setIsAuthenticated(true);
      setCurrentAdmin(user);
      localStorage.setItem('aurastay_superadmin_auth', 'true');
      localStorage.setItem('aurastay_superadmin_user', JSON.stringify(user));
      showNotification('Welcome to AuraStay Super Admin SaaS Control Portal');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('aurastay_superadmin_auth');
    localStorage.removeItem('aurastay_superadmin_user');
    showNotification('Logged out successfully', 'info');
  };

  // 6. Tenant Management Actions
  const addHotel = async (newHotel) => {
    const hotelId = newHotel.id || `hotel_${newHotel.slug.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now().toString().slice(-4)}`;
    const hotel = {
      ...newHotel,
      id: hotelId,
      createdAt: new Date().toISOString()
    };

    setHotels(prev => [hotel, ...prev.filter(h => h.id !== hotel.id && h.email !== hotel.email)]);
    showNotification(`Tenant hotel "${hotel.name}" created with admin login: ${hotel.email}`);
    setIsCreateHotelModalOpen(false);

    // Save to Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase.from('hotels').insert({
          id: hotel.id,
          slug: hotel.slug,
          name: hotel.name,
          short_name: hotel.shortName || 'AST',
          logo_url: hotel.logoUrl || null,
          owner_name: hotel.ownerName,
          email: hotel.email,
          password: hotel.password,
          mobile: hotel.mobile,
          address: hotel.address,
          city: hotel.city,
          total_rooms: hotel.totalRooms,
          currency: hotel.currency,
          currency_symbol: hotel.currencySymbol,
          status: hotel.status,
          plan: hotel.plan,
          commission_rate: hotel.commissionRate
        });
      } catch (err) {
        console.warn('Supabase hotel insert synced locally', err);
      }
    }
  };

  const updateHotel = async (updated) => {
    setHotels(prev => prev.map(h => h.id === updated.id ? { ...h, ...updated } : h));
    showNotification(`Tenant "${updated.name}" updated successfully`);
    setEditingHotel(null);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('hotels').update({
          name: updated.name,
          slug: updated.slug,
          logo_url: updated.logoUrl,
          owner_name: updated.ownerName,
          email: updated.email,
          password: updated.password,
          mobile: updated.mobile,
          address: updated.address,
          city: updated.city,
          total_rooms: updated.totalRooms,
          status: updated.status,
          plan: updated.plan,
          commission_rate: updated.commissionRate
        }).eq('id', updated.id);
      } catch (err) {
        console.warn('Supabase hotel update synced locally', err);
      }
    }
  };

  const toggleHotelStatus = async (hotelId) => {
    const hotel = hotels.find(h => h.id === hotelId);
    if (!hotel) return;
    const newStatus = hotel.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateHotel({ ...hotel, status: newStatus });
  };

  // 7. Aggregated Platform Metrics
  const metrics = {
    totalHotels: hotels.length,
    activeHotels: hotels.filter(h => h.status === 'ACTIVE').length,
    totalRooms: globalRooms.length > 0 ? globalRooms.length : hotels.reduce((acc, h) => acc + (Number(h.totalRooms) || 0), 0),
    totalBookings: globalReservations.length,
    totalGrossRevenue: globalReservations.reduce((acc, r) => acc + (Number(r.amount) || 0), 0),
    confirmedBookings: globalReservations.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN').length,
  };

  return (
    <SuperAdminContext.Provider value={{
      isAuthenticated,
      currentAdmin,
      hotels,
      globalRooms,
      globalReservations,
      metrics,
      activeTab,
      setActiveTab,
      notification,
      showNotification,
      isCreateHotelModalOpen,
      setIsCreateHotelModalOpen,
      editingHotel,
      setEditingHotel,
      isSqlModalOpen,
      setIsSqlModalOpen,
      login,
      logout,
      addHotel,
      updateHotel,
      toggleHotelStatus
    }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error('useSuperAdmin must be used within SuperAdminProvider');
  return ctx;
}
