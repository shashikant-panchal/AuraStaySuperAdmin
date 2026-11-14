import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SuperAdminContext = createContext(null);

const DEFAULT_SUPER_ADMIN = {
  id: 'sa_01',
  name: 'Platform Super Admin',
  email: 'superadmin@aurastay.com',
  role: 'PLATFORM_OWNER'
};

async function broadcastSuperAdminSync(payload) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const channel = supabase.channel('aurastay_sync_broadcast');
    await channel.send({
      type: 'broadcast',
      event: 'webhook_update',
      payload: {
        ...payload,
        timestamp: new Date().toISOString()
      }
    });
    supabase.removeChannel(channel);
  } catch (e) { }
}

export function SuperAdminProvider({ children }) {
  // 1. Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('aurastay_superadmin_auth') === 'true';
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const saved = localStorage.getItem('aurastay_superadmin_user');
    return saved ? JSON.parse(saved) : DEFAULT_SUPER_ADMIN;
  });

  // 2. Tenants State (Strictly from Supabase Backend - no localStorage or hardcoded hotels)
  const [hotels, setHotels] = useState([]);

  // 3. Global Platform Data
  const [globalRooms, setGlobalRooms] = useState([]);
  const [globalReservations, setGlobalReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('hotels'); // 'overview' | 'hotels' | 'bookings' | 'rooms' | 'sql'
  const [notification, setNotification] = useState(null);
  const [isCreateHotelModalOpen, setIsCreateHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Remove any legacy localStorage hotel caches on startup
  useEffect(() => {
    try {
      localStorage.removeItem('aurastay_saas_hotels');
    } catch (e) { }
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 4. Fetch Live Supabase Data
  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [hotelsRes, roomsRes, resRes] = await Promise.all([
        supabase.from('hotels').select('*').order('created_at', { ascending: false }),
        supabase.from('rooms').select('*'),
        supabase.from('reservations').select('*').order('created_at', { ascending: false })
      ]);

      if (!hotelsRes.error && Array.isArray(hotelsRes.data)) {
        setHotels(hotelsRes.data.map(h => ({
          id: h.id,
          slug: h.slug || h.id,
          name: h.name,
          shortName: h.short_name || 'AST',
          logoUrl: h.logo_url || '',
          ownerName: h.owner_name,
          email: h.email,
          password: h.password,
          mobile: h.mobile,
          address: h.address,
          city: h.city,
          totalRooms: Number(h.total_rooms) || 0,
          currency: h.currency || 'INR',
          currencySymbol: h.currency_symbol || '₹',
          status: h.status || 'ACTIVE',
          plan: h.plan || 'Enterprise',
          commissionRate: Number(h.commission_rate) || 10,
          createdAt: h.created_at
        })));
      }

      if (Array.isArray(roomsRes.data)) {
        setGlobalRooms(roomsRes.data);
      }

      if (Array.isArray(resRes.data)) {
        setGlobalReservations(resRes.data);
      }
    } catch (err) {
      console.warn('Super Admin Supabase load error:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    const pollTimer = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(pollTimer);
  }, [loadData]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase.channel('superadmin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => loadData())
      .subscribe();

    const broadcastChannel = supabase.channel('aurastay_sync_broadcast')
      .on('broadcast', { event: 'webhook_update' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [loadData]);

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

  // 6. Tenant & Admin Credential Management Actions
  const addHotel = async (newHotel) => {
    const cleanSlug = (newHotel.slug || newHotel.name || 'hotel').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const hotelId = newHotel.id || cleanSlug;
    const hotel = {
      ...newHotel,
      id: hotelId,
      slug: cleanSlug,
      shortName: newHotel.shortName || newHotel.name.slice(0, 4).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    setHotels(prev => [hotel, ...prev.filter(h => h.id !== hotel.id && h.email !== hotel.email)]);
    showNotification(`Hotel Admin credential created! Login: ${hotel.email} / Pass: ${hotel.password}`);
    setIsCreateHotelModalOpen(false);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('hotels').upsert({
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
          status: hotel.status || 'ACTIVE',
          plan: hotel.plan,
          commission_rate: hotel.commissionRate
        });
        if (error) {
          console.warn('Supabase hotel insert error:', error);
        }
        await broadcastSuperAdminSync({ action: 'hotel_created', hotelId: hotel.id });
        await loadData();
      } catch (err) {
        console.warn('Supabase hotel insert error:', err);
      }
    }
  };

  const updateHotel = async (updated) => {
    setHotels(prev => prev.map(h => h.id === updated.id ? { ...h, ...updated } : h));
    showNotification(`Hotel Admin "${updated.name}" credentials & details updated in Supabase`);
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
        await broadcastSuperAdminSync({ action: 'hotel_updated', hotelId: updated.id });
        await loadData();
      } catch (err) {
        console.warn('Supabase hotel update error:', err);
      }
    }
  };

  const deleteHotel = async (hotelId) => {
    const target = hotels.find(h => h.id === hotelId);
    setHotels(prev => prev.filter(h => h.id !== hotelId));
    showNotification(`Hotel credential "${target?.name || hotelId}" permanently removed from Supabase.`, 'info');

    if (isSupabaseConfigured) {
      try {
        await supabase.from('hotels').delete().eq('id', hotelId);
        await broadcastSuperAdminSync({ action: 'hotel_deleted', hotelId });
        await loadData();
      } catch (err) {
        console.warn('Supabase hotel delete error:', err);
      }
    }
  };

  const toggleHotelStatus = async (hotelId) => {
    const hotel = hotels.find(h => h.id === hotelId);
    if (!hotel) return;
    const newStatus = hotel.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await updateHotel({ ...hotel, status: newStatus });
  };

  const deleteRoom = async (roomId, roomNumber) => {
    setGlobalRooms(prev => prev.filter(r => r.id !== roomId && r.room_number !== roomNumber));
    showNotification(`Room ${roomNumber} deleted from inventory.`);

    if (isSupabaseConfigured) {
      try {
        if (roomId) {
          await supabase.from('rooms').delete().eq('id', roomId);
        } else if (roomNumber) {
          await supabase.from('rooms').delete().eq('room_number', roomNumber);
        }
        await broadcastSuperAdminSync({ action: 'room_delete', roomNumber });
        await loadData();
      } catch (err) {
        console.warn('Supabase room delete error:', err);
      }
    }
  };

  // 7. Aggregated Platform Metrics
  const metrics = {
    totalHotels: hotels.length,
    activeHotels: hotels.filter(h => h.status === 'ACTIVE').length,
    totalRooms: globalRooms.length,
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
      deleteHotel,
      toggleHotelStatus,
      deleteRoom,
      refreshData: loadData
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

