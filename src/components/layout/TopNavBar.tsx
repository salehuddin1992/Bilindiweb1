import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Bell,
  MessageSquare,
  Moon,
  Sun,
  Home,
  PlaySquare,
  BookOpen,
  Users,
  User as UserIcon,
  ChevronDown,
  Shield,
  Cloud,
  CheckCircle2,
  Settings,
  LogOut,
  GraduationCap,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavTab, User as AppUser, UserRole } from '../../types';
import { NotificationModal } from '../modals/NotificationModal';
import { BilindiLogo } from '../common/BilindiLogo';
import { supabase } from '../../services/supabaseClient';

export const TopNavBar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    logout,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isDarkMode,
    toggleDarkMode,
    notifications,
    directMessages,
    posts,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  /**
   * Logika Integrasi Supabase:
   * Memanggil sesi pengguna yang sedang login dari Supabase Auth,
   * lalu menarik data profil aslinya (nama, foto profil, dan peran/role)
   * dari tabel database 'users' di Supabase.
   */
  const fetchSupabaseProfile = async () => {
    try {
      setIsSyncingSupabase(true);
      setSyncStatus(null);

      // 1. Ambil session pengguna aktif dari Supabase Auth
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('Supabase getSession warning:', sessionError.message);
      }

      const authUser = session?.user;

      // 2. Tarik data profil dari tabel database 'users' di Supabase
      // Menggunakan authUser id jika login via Auth, atau id/username dari currentUser saat ini
      const lookupId = authUser?.id || currentUser?.id;
      const lookupUsername = authUser?.email?.split('@')[0] || currentUser?.username;

      if (!lookupId && !lookupUsername) {
        setIsSyncingSupabase(false);
        return;
      }

      let query = supabase.from('users').select('*');
      if (lookupId && lookupUsername) {
        query = query.or(`id.eq.${lookupId},username.eq.${lookupUsername}`);
      } else if (lookupId) {
        query = query.eq('id', lookupId);
      } else {
        query = query.eq('username', lookupUsername);
      }

      const { data: dbUser, error: dbError } = await query.maybeSingle();

      if (dbError) {
        console.warn('Gagal menarik profil database Supabase:', dbError.message);
        setSyncStatus('Gagal membaca database Supabase');
      } else if (dbUser) {
        // Terapkan data asli dari Supabase database
        const syncedUser: AppUser = {
          id: dbUser.id || lookupId || 'u_active',
          name:
            dbUser.name ||
            authUser?.user_metadata?.name ||
            authUser?.user_metadata?.full_name ||
            currentUser?.name ||
            'Pengguna Terdaftar',
          role: (dbUser.role?.toUpperCase() === 'TEACHER'
            ? 'TEACHER'
            : dbUser.role?.toUpperCase() === 'PRINCIPAL'
            ? 'PRINCIPAL'
            : 'STUDENT') as UserRole,
          username: dbUser.username || lookupUsername || 'user',
          password: dbUser.password,
          className: dbUser.class_name || currentUser?.className,
          subject: dbUser.subject || currentUser?.subject,
          avatarUrl:
            dbUser.avatar_url ||
            authUser?.user_metadata?.avatar_url ||
            currentUser?.avatarUrl ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          coverUrl: dbUser.cover_url || currentUser?.coverUrl,
          bio: dbUser.bio || currentUser?.bio || '',
          location: dbUser.location || currentUser?.location || 'Sinombayuga',
          school: dbUser.school || currentUser?.school || 'SMP Negeri sinombayuga',
          badges: dbUser.badges || currentUser?.badges || ['Akun Supabase Terverifikasi'],
          isApproved: dbUser.is_approved ?? true,
        };

        setCurrentUser(syncedUser);
        setSyncStatus('Profil Supabase tersinkron');
        setTimeout(() => setSyncStatus(null), 3000);
      }
    } catch (err) {
      console.warn('Error fetching Supabase profile:', err);
      setSyncStatus('Terjadi kesalahan koneksi');
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  // Ambil profil Supabase saat inisialisasi & dengarkan perubahan sesi Supabase Auth
  useEffect(() => {
    fetchSupabaseProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        fetchSupabaseProfile();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Handle Logout yang memicu sign out dari Supabase
  const handleLogout = async () => {
    setShowUserDropdown(false);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Supabase sign out error:', error);
    }
    if (logout) {
      await logout();
    } else {
      setCurrentUser(null);
    }
  };

  const isTeacherOrAdmin =
    currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';

  // Count unread notifications
  const unreadNotifs = notifications.filter(
    (n) =>
      !n.isRead &&
      (n.recipientId === currentUser?.id ||
        (n.recipientId === 'TEACHERS' && isTeacherOrAdmin) ||
        n.recipientId === 'ALL')
  ).length;

  // Count pending moderation posts for teacher badge
  const pendingModeration = isTeacherOrAdmin
    ? posts.filter((p) => p.status === 'PENDING').length
    : 0;

  const totalNotifBadge = unreadNotifs + pendingModeration;

  // Count unread direct messages
  const unreadMessages = directMessages.filter(
    (m) => m.recipientId === currentUser?.id && !m.isRead
  ).length;

  const navItems: { tab: NavTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Beranda', icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { tab: 'reels', label: 'Reels', icon: <PlaySquare className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { tab: 'assignments', label: 'Learn', icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { tab: 'classes', label: 'Kelas', icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" /> },
    { tab: 'profile', label: 'Profil', icon: <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 h-14 bg-white dark:bg-[#242526] border-b border-slate-200 dark:border-[#3e4042] shadow-xs px-3 sm:px-4 flex items-center justify-between transition-colors">
        {/* Left Zone: Brand Logo & Search */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab('home');
              setSearchQuery('');
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <BilindiLogo size={36} showWordmark={true} />
          </button>

          {/* Cloud Sync Status Indicator */}
          <div
            title="Database Supabase & Cloud Storage Aktif"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800 shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Cloud className="w-3.5 h-3.5" />
            <span>Supabase Cloud</span>
          </div>

          {/* Quick Search Field */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi, #tag, siswa..."
              className="w-full bg-slate-100 dark:bg-[#3a3b3c] text-xs text-slate-900 dark:text-white pl-9 pr-7 py-2 rounded-full border border-transparent focus:border-[#1877F2] focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Center Zone: Facebook Navigation Tabs */}
        <nav className="flex items-center justify-center flex-1 max-w-md mx-2 sm:mx-4 h-full">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`relative flex-1 flex flex-col items-center justify-center h-full px-2 sm:px-4 transition-colors ${
                  isActive
                    ? 'text-[#1877F2]'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] hover:rounded-xl'
                }`}
                title={item.label}
              >
                {item.icon}
                {isActive && (
                  <span className="absolute bottom-0 inset-x-2 h-1 bg-[#1877F2] rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Zone: Controls & Current User Profile Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Menu Profil Akun Tunggal (Supabase Real Auth) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-slate-100 dark:bg-[#3a3b3c] hover:bg-slate-200 dark:hover:bg-[#4e4f50] text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700/60 shadow-2xs"
              title="Menu Akun Profil"
              aria-label="Menu Akun Profil"
            >
              <div className="relative">
                <img
                  src={
                    currentUser?.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={currentUser?.name || 'Profil'}
                  className="w-7 h-7 rounded-full object-cover border border-white dark:border-[#242526]"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-[#242526]" />
              </div>
              <span className="hidden xl:inline text-slate-800 dark:text-slate-100 max-w-24 truncate font-semibold">
                {currentUser?.name ? currentUser.name.split(' ')[0] : 'Akun'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                  showUserDropdown ? 'rotate-180 text-[#1877F2]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Material Design */}
            {showUserDropdown && (
              <div className="absolute right-0 top-12 z-50 w-72 bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] p-2.5 space-y-2 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                {/* 1. Informasi Akun Aktif (Current User) */}
                <div
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserDropdown(false);
                  }}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#18191a] hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-[#3a3b3c] cursor-pointer transition-all space-y-2.5 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          currentUser?.avatarUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={currentUser?.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-[#3a3b3c] shadow-xs"
                      />
                      <span
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#242526]"
                        title="Aktif"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-[#1877F2] transition-colors">
                          {currentUser?.name || 'Pengguna'}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        @{currentUser?.username || 'user'} · {currentUser?.school || 'SMP Negeri Sinombayuga'}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge Status */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-800">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        currentUser?.role === 'TEACHER'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : currentUser?.role === 'PRINCIPAL'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {currentUser?.role === 'TEACHER' ? (
                        <>
                          <GraduationCap className="w-3 h-3" />
                          Guru · {currentUser.subject || 'Mata Pelajaran'}
                        </>
                      ) : currentUser?.role === 'PRINCIPAL' ? (
                        <>
                          <Shield className="w-3 h-3" />
                          Kepala Sekolah
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3 h-3" />
                          Siswa · Kelas {currentUser?.className || 'VII-A'}
                        </>
                      )}
                    </span>

                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Supabase
                    </span>
                  </div>
                </div>

                {/* Status info bar if sync happened */}
                {syncStatus && (
                  <div className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-[10px] text-[#1877F2] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{syncStatus}</span>
                  </div>
                )}

                {/* 2. Menu Navigasi & Aksi Pengguna */}
                <div className="py-1 space-y-1">
                  {/* Pengaturan Profil */}
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] font-semibold transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#3a3b3c] group-hover:bg-blue-50 dark:group-hover:bg-blue-950 text-slate-600 dark:text-slate-300 group-hover:text-[#1877F2] flex items-center justify-center transition-colors">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block font-bold">Pengaturan Profil</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Lihat portofolio & biodata akun
                      </span>
                    </div>
                  </button>

                  {/* Pengaturan Akun & Keamanan */}
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] font-semibold transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#3a3b3c] group-hover:bg-slate-200 dark:group-hover:bg-[#4e4f50] text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors">
                      <Settings className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block font-bold">Pengaturan & Keamanan</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        Kata sandi & preferensi sistem
                      </span>
                    </div>
                  </button>

                  {/* Tombol Segarkan Sinkronisasi Supabase */}
                  <button
                    onClick={fetchSupabaseProfile}
                    disabled={isSyncingSupabase}
                    className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] font-medium transition-colors"
                    title="Tarik data profil terbaru dari Supabase"
                  >
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#3a3b3c] text-emerald-600 flex items-center justify-center">
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          isSyncingSupabase ? 'animate-spin' : ''
                        }`}
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {isSyncingSupabase ? 'Memuat Database...' : 'Sinkron Data Supabase'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        Perbarui profil dari tabel users
                      </span>
                    </div>
                  </button>
                </div>

                {/* 3. Tombol Keluar (Logout) Supabase */}
                <div className="pt-1.5 border-t border-slate-100 dark:border-[#3a3b3c]">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block">Keluar (Logout)</span>
                      <span className="text-[10px] text-red-400 font-normal">
                        Akhiri sesi autentikasi Supabase
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Switch */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#3a3b3c] hover:bg-slate-200 dark:hover:bg-[#4e4f50] text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Messenger Chat Icon */}
          <button
            onClick={() => setActiveTab('messenger')}
            className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-[#3a3b3c] hover:bg-slate-200 dark:hover:bg-[#4e4f50] text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
            title="Messenger Sekolah"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadMessages}
              </span>
            )}
          </button>

          {/* Notification Icon */}
          <button
            onClick={() => setShowNotificationModal(true)}
            className="relative w-9 h-9 rounded-full bg-slate-100 dark:bg-[#3a3b3c] hover:bg-slate-200 dark:hover:bg-[#4e4f50] text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
            title="Notifikasi & Verifikasi"
          >
            <Bell className="w-4 h-4" />
            {totalNotifBadge > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {totalNotifBadge > 99 ? '99+' : totalNotifBadge}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Notification Modal */}
      {showNotificationModal && (
        <NotificationModal onDismiss={() => setShowNotificationModal(false)} />
      )}
    </>
  );
};
