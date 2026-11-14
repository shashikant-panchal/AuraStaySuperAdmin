import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const SuperAdminContext = createContext(null);

const SUPERADMIN_EMAIL = 'superadmin@aavasa.com';
const SUPERADMIN_PASSWORD = 'aavasa@18';

const DEFAULT_SUPER_ADMIN = {
  id: 'sa_aavasa_01',
  name: 'Aavasa Super Admin',
  email: SUPERADMIN_EMAIL,
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

function isLegacyAuraStayRecord(h) {
  const id = String(h?.id || '').trim().toLowerCase();
  const slug = String(h?.slug || '').trim().toLowerCase();
  const email = String(h?.email || '').trim().toLowerCase();
  const name = String(h?.name || '').trim().toLowerCase();
  return (
    id === 'hotel_aurastay_01' ||
    slug === 'aurastay-suite' ||
    email === 'admin@aurastay.com' ||
    name === 'aurastay suite' ||
    name === 'aurastay suite & resort'
  );
}

export function SuperAdminProvider({ children }) {
  // 1. Auth State - Strictly validated against superadmin@aavasa.com
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const authFlag = localStorage.getItem('aavasa_superadmin_auth_v2') === 'true';
      const savedUser = JSON.parse(localStorage.getItem('aavasa_superadmin_user_v2') || 'null');
      return Boolean(authFlag && savedUser && String(savedUser.email).toLowerCase() === SUPERADMIN_EMAIL);
    } catch (e) {
      return false;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('aavasa_superadmin_user_v2') || 'null');
      if (saved && String(saved.email).toLowerCase() === SUPERADMIN_EMAIL) {
        return saved;
      }
    } catch (e) { }
    return DEFAULT_SUPER_ADMIN;
  });

  // 2. Tenants / Admin Credentials State (Strictly from Supabase Backend)
  const [hotels, setHotels] = useState([]);

  // 3. Global Platform Data
  const [globalRooms, setGlobalRooms] = useState([]);
  const [globalReservations, setGlobalReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('hotels'); // 'hotels' | 'bookings' | 'rooms'
  const [notification, setNotification] = useState(null);
  const [isCreateHotelModalOpen, setIsCreateHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Purge all legacy AuraStay localStorage keys on startup
  useEffect(() => {
    try {
      localStorage.removeItem('aurastay_saas_hotels');
      localStorage.removeItem('aurastay_superadmin_auth');
      localStorage.removeItem('aurastay_superadmin_user');
    } catch (e) { }
  }, []);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 4. Fetch Live Supabase Data & Purge any legacy AuraStay row
  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      const [hotelsRes, roomsRes, resRes] = await Promise.all([
        supabase.from('hotels').select('*').order('created_at', { ascending: false }),
        supabase.from('rooms').select('*'),
        supabase.from('reservations').select('*').order('created_at', { ascending: false })
      ]);

      if (!hotelsRes.error && Array.isArray(hotelsRes.data)) {
        const legacyRows = hotelsRes.data.filter(isLegacyAuraStayRecord);
        if (legacyRows.length > 0) {
          for (const legacy of legacyRows) {
            await supabase.from('hotels').delete().eq('id', legacy.id);
          }
        }

        const validHotels = hotelsRes.data.filter(h => !isLegacyAuraStayRecord(h));
        const validHotelIds = new Set(
          validHotels.flatMap(h => [
            String(h.id || '').trim().toLowerCase(),
            String(h.slug || '').trim().toLowerCase()
          ]).filter(Boolean)
        );

        setHotels(validHotels.map(h => ({
          id: h.id,
          slug: h.slug || h.id,
          name: h.name,
          shortName: h.short_name || h.name?.slice(0, 4).toUpperCase() || 'HTL',
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

        if (Array.isArray(roomsRes.data)) {
          const orphanRooms = roomsRes.data.filter(
            r => !r.hotel_id || !validHotelIds.has(String(r.hotel_id).trim().toLowerCase())
          );
          if (orphanRooms.length > 0) {
            for (const orph of orphanRooms) {
              if (orph.id) {
                await supabase.from('rooms').delete().eq('id', orph.id);
              } else if (orph.room_number) {
                await supabase.from('rooms').delete().eq('room_number', orph.room_number);
              }
            }
          }
          setGlobalRooms(
            roomsRes.data.filter(
              r => r.hotel_id && validHotelIds.has(String(r.hotel_id).trim().toLowerCase())
            )
          );
        }

        if (Array.isArray(resRes.data)) {
          const orphanRes = resRes.data.filter(
            r => !r.hotel_id || !validHotelIds.has(String(r.hotel_id).trim().toLowerCase())
          );
          if (orphanRes.length > 0) {
            for (const orph of orphanRes) {
              if (orph.id) {
                await supabase.from('reservations').delete().eq('id', orph.id);
              }
            }
          }
          setGlobalReservations(
            resRes.data.filter(
              r => r.hotel_id && validHotelIds.has(String(r.hotel_id).trim().toLowerCase())
            )
          );
        }
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

  // 5. Strict Super Admin Authentication (superadmin@aavasa.com / aavasa@18)
  const login = async (email, password) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const rawPass = String(password || '').trim();

    if (!cleanEmail || !rawPass) {
      return { success: false, message: 'Please enter both Super Admin email and password.' };
    }

    if (cleanEmail !== SUPERADMIN_EMAIL || rawPass !== SUPERADMIN_PASSWORD) {
      return {
        success: false,
        message: 'Invalid Super Admin credentials. Only authorized Aavasa Super Admin credentials are allowed.'
      };
    }

    const user = {
      ...DEFAULT_SUPER_ADMIN,
      email: SUPERADMIN_EMAIL
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('super_admins').upsert({
          id: 'sa_aavasa_01',
          name: 'Aavasa Super Admin',
          email: SUPERADMIN_EMAIL,
          password: SUPERADMIN_PASSWORD,
          role: 'PLATFORM_OWNER'
        });
      } catch (e) { }
    }

    setIsAuthenticated(true);
    setCurrentAdmin(user);
    localStorage.setItem('aavasa_superadmin_auth_v2', 'true');
    localStorage.setItem('aavasa_superadmin_user_v2', JSON.stringify(user));
    showNotification('Signed in to Aavasa Super Admin Control Portal');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('aavasa_superadmin_auth_v2');
    localStorage.removeItem('aavasa_superadmin_user_v2');
    showNotification('Logged out successfully', 'info');
  };

  // 6. Admin Credential & Tenant Management Actions
  const addHotel = async (newHotel) => {
    const cleanEmail = String(newHotel.email || '').trim().toLowerCase();
    const cleanPassword = String(newHotel.password || '').trim();
    const cleanName = String(newHotel.name || '').trim();
    const cleanSlug = (newHotel.slug || cleanName || 'property')
      .replace(/[^a-z0-9-]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      .toLowerCase();

    if (!cleanName || !cleanSlug || !cleanEmail || !cleanPassword) {
      return { success: false, message: 'Property Name, ID/Slug, Admin Email, and Password are all required.' };
    }

    if (cleanEmail === SUPERADMIN_EMAIL) {
      return { success: false, message: 'Cannot use Super Admin email for a Hotel Admin credential.' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, message: 'Admin password must be at least 6 characters long.' };
    }

    const duplicate = hotels.find(
      h =>
        String(h.email || '').toLowerCase() === cleanEmail ||
        String(h.slug || '').toLowerCase() === cleanSlug ||
        String(h.id || '').toLowerCase() === cleanSlug
    );
    if (duplicate) {
      return {
        success: false,
        message: `An Admin credential with email "${cleanEmail}" or ID "${cleanSlug}" already exists.`
      };
    }

    const hotelId = newHotel.id || cleanSlug;
    const shortCode = (newHotel.shortName || cleanName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4) || 'HTL').toUpperCase();

    const hotel = {
      ...newHotel,
      id: hotelId,
      slug: cleanSlug,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      shortName: shortCode,
      ownerName: newHotel.ownerName?.trim() || `${cleanName} Admin`,
      mobile: newHotel.mobile?.trim() || '+91 98765 43210',
      address: newHotel.address?.trim() || `${newHotel.city || 'Bengaluru'}, India`,
      city: newHotel.city?.trim() || 'Bengaluru',
      totalRooms: Number(newHotel.totalRooms) || 20,
      currency: newHotel.currency || 'INR',
      currencySymbol: newHotel.currencySymbol || '₹',
      status: newHotel.status || 'ACTIVE',
      plan: newHotel.plan || 'Enterprise',
      commissionRate: Number(newHotel.commissionRate) || 10,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      try {
        // Ensure a completely fresh start for this new Admin credential by removing any leftover data from previous logins
        await Promise.all([
          supabase.from('rooms').delete().eq('hotel_id', hotel.id),
          supabase.from('room_types').delete().eq('hotel_id', hotel.id),
          supabase.from('reservations').delete().eq('hotel_id', hotel.id),
          supabase.from('fnb_orders').delete().eq('hotel_id', hotel.id),
          supabase.from('housekeeping_tasks').delete().eq('hotel_id', hotel.id),
          supabase.from('cab_bookings').delete().eq('hotel_id', hotel.id),
          supabase.from('financial_invoices').delete().eq('hotel_id', hotel.id),
          supabase.from('banquet_bookings').delete().eq('hotel_id', hotel.id)
        ]);

        const { error } = await supabase.from('hotels').upsert({
          id: hotel.id,
          slug: hotel.slug,
          name: hotel.name,
          short_name: hotel.shortName,
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
        if (error) {
          console.warn('Supabase hotel insert error:', error);
          return { success: false, message: `Database error: ${error.message}` };
        }
        await broadcastSuperAdminSync({ action: 'hotel_created', hotelId: hotel.id });
        await loadData();
      } catch (err) {
        console.warn('Supabase hotel insert error:', err);
        return { success: false, message: 'Failed to save credential to Supabase.' };
      }
    }

    setHotels(prev => [hotel, ...prev.filter(h => h.id !== hotel.id && h.email !== hotel.email)]);
    showNotification(`Admin credential created! Login: ${hotel.email} | Password: ${hotel.password}`);
    setIsCreateHotelModalOpen(false);
    return { success: true, hotel };
  };

  const updateHotel = async (updated) => {
    const cleanEmail = String(updated.email || '').trim().toLowerCase();
    const cleanPassword = String(updated.password || '').trim();
    const cleanName = String(updated.name || '').trim();
    const cleanSlug = String(updated.slug || updated.id || '').trim().toLowerCase();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      showNotification('Property Name, Admin Email, and Password cannot be empty.', 'error');
      return { success: false, message: 'Property Name, Admin Email, and Password cannot be empty.' };
    }

    if (cleanPassword.length < 6) {
      showNotification('Admin password must be at least 6 characters.', 'error');
      return { success: false, message: 'Admin password must be at least 6 characters.' };
    }

    setHotels(prev => prev.map(h => h.id === updated.id ? { ...h, ...updated, email: cleanEmail, password: cleanPassword, name: cleanName, slug: cleanSlug } : h));
    showNotification(`Admin credentials for "${cleanName}" updated in Supabase`);
    setEditingHotel(null);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('hotels').update({
          name: cleanName,
          slug: cleanSlug,
          logo_url: updated.logoUrl,
          owner_name: updated.ownerName,
          email: cleanEmail,
          password: cleanPassword,
          mobile: updated.mobile,
          address: updated.address,
          city: updated.city,
          total_rooms: updated.totalRooms,
          status: updated.status,
          plan: updated.plan,
          commission_rate: updated.commissionRate,
          updated_at: new Date().toISOString()
        }).eq('id', updated.id);
        await broadcastSuperAdminSync({ action: 'hotel_updated', hotelId: updated.id });
        await loadData();
      } catch (err) {
        console.warn('Supabase hotel update error:', err);
      }
    }
    return { success: true };
  };

  const deleteHotel = async (hotelId) => {
    const target = hotels.find(h => h.id === hotelId);
    setHotels(prev => prev.filter(h => h.id !== hotelId));
    setGlobalRooms(prev => prev.filter(r => r.hotel_id !== hotelId));
    setGlobalReservations(prev => prev.filter(r => r.hotel_id !== hotelId));
    showNotification(`Admin credential "${target?.email || hotelId}" and all associated rooms/data removed from Supabase.`, 'info');

    if (isSupabaseConfigured) {
      try {
        await Promise.all([
          supabase.from('rooms').delete().eq('hotel_id', hotelId),
          supabase.from('room_types').delete().eq('hotel_id', hotelId),
          supabase.from('reservations').delete().eq('hotel_id', hotelId),
          supabase.from('fnb_orders').delete().eq('hotel_id', hotelId),
          supabase.from('housekeeping_tasks').delete().eq('hotel_id', hotelId),
          supabase.from('cab_bookings').delete().eq('hotel_id', hotelId),
          supabase.from('financial_invoices').delete().eq('hotel_id', hotelId),
          supabase.from('banquet_bookings').delete().eq('hotel_id', hotelId),
          supabase.from('hotels').delete().eq('id', hotelId)
        ]);
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
