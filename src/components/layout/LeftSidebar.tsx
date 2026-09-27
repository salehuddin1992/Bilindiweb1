import React from 'react';
import {
  Home,
  PlaySquare,
  BookOpen,
  Users,
  MessageSquare,
  User as UserIcon,
  Settings,
  Lock,
  Plus,
  School,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';

export const LeftSidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    classes,
    selectedClassFilter,
    setSelectedClassFilter,
  } = useApp();

  const isTeacherOrAdmin =
    currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';

  const menuItems: { tab: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { tab: 'home', label: 'Beranda Pembelajaran', icon: <Home className="w-5 h-5 text-[#1877F2]" /> },
    { tab: 'reels', label: 'Reels Edukasi & Simulasi', icon: <PlaySquare className="w-5 h-5 text-red-500" /> },
    { tab: 'assignments', label: 'Modul Belajar & Tugas', icon: <BookOpen className="w-5 h-5 text-emerald-600" /> },
    { tab: 'classes', label: 'Ruang Kelas & Siswa', icon: <Users className="w-5 h-5 text-purple-600" /> },
    { tab: 'messenger', label: 'Messenger Sekolah', icon: <MessageSquare className="w-5 h-5 text-[#1877F2]" /> },
    { tab: 'profile', label: 'Profil & Lencana Saya', icon: <UserIcon className="w-5 h-5 text-amber-500" /> },
    { tab: 'settings', label: 'Pengaturan & Keamanan', icon: <Settings className="w-5 h-5 text-slate-500" /> },
  ];

  return (
    <aside className="space-y-4 text-xs">
      {/* 1. User Summary Card */}
      <div
        onClick={() => setActiveTab('profile')}
        className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#242526] hover:bg-slate-50 dark:hover:bg-[#3a3b3c] border border-slate-200 dark:border-[#3e4042] shadow-xs cursor-pointer transition-colors"
      >
        <img
          src={currentUser?.avatarUrl}
          alt={currentUser?.name}
          className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-[#3e4042]"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">
            {currentUser?.name}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 truncate">
            {currentUser?.role === 'TEACHER'
              ? `Guru · ${currentUser.subject || 'IPA'}`
              : currentUser?.role === 'PRINCIPAL'
              ? 'Kepala Sekolah'
              : `Siswa · Kelas ${currentUser?.className || 'VII-A'}`}
          </p>
        </div>
      </div>

      {/* 2. Class Lock / Switcher Widget */}
      {currentUser?.role === 'STUDENT' ? (
        <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#1877F2] block text-xs">
              Ruang Kelas: {currentUser.className || 'VII-A'}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Akses terkunci ke kelasmu agar materi terarah.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-white dark:bg-[#242526] rounded-xl border border-slate-200 dark:border-[#3e4042] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Filter Kelas Pengampu:
            </span>
            <span className="text-[10px] font-bold text-[#1877F2] bg-blue-50 px-2 py-0.5 rounded">
              {selectedClassFilter}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {['Semua Kelas', 'VII-A', 'VII-B', 'VIII-B'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClassFilter(cls)}
                className={`py-1.5 px-2 rounded-lg text-center font-semibold transition-colors ${
                  selectedClassFilter === cls
                    ? 'bg-[#1877F2] text-white'
                    : 'bg-slate-100 dark:bg-[#3a3b3c] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Navigation Links */}
      <nav className="bg-white dark:bg-[#242526] rounded-2xl border border-slate-200 dark:border-[#3e4042] p-1.5 space-y-0.5 shadow-xs">
        {menuItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1877F2] font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c]'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 4. Ruang Komunitas / Pintasan Kelas */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl border border-slate-200 dark:border-[#3e4042] p-4 space-y-3 shadow-xs">
        <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
          Pintasan Komunitas SMP
        </h4>
        <div className="space-y-2">
          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => {
                setSelectedClassFilter(cls.name.replace(/^Kelas\s+/i, ''));
                setActiveTab('classes');
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-left transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                  {cls.name.slice(0, 2)}
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {cls.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {cls.studentCount} murid
              </span>
            </button>
          ))}

          {/* PhET simulation shortcut */}
          <a
            href="https://phet.colorado.edu"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-700 dark:text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-[#1877F2] flex items-center justify-center font-bold text-[10px]">
                Ph
              </div>
              <span className="font-medium">Lab Interaktif PhET</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* 5. Status Akun Aktif Supabase */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl border border-slate-200 dark:border-[#3e4042] p-3 text-[11px] space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
            Akun Aktif (Supabase)
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Tersambung
          </span>
        </div>
        <div className="flex items-center gap-2.5 pt-0.5">
          <img
            src={currentUser?.avatarUrl}
            alt={currentUser?.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-[#3e4042]"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">
              {currentUser?.name}
            </p>
            <p className="text-[10px] text-slate-500 truncate">
              {currentUser?.role === 'TEACHER'
                ? `Guru · ${currentUser.subject || 'IPA'}`
                : currentUser?.role === 'PRINCIPAL'
                ? 'Kepala Sekolah'
                : `Siswa · Kelas ${currentUser?.className || 'VII-A'}`}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
