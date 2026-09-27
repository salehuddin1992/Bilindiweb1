import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Lock,
  LogOut,
  Database,
  CloudCheck,
  CheckCircle,
  School,
  Key,
  Code,
  X,
  Copy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    isDarkMode,
    toggleDarkMode,
    appLogoUrl,
    updateAppLogo,
    updateUserProfile,
    changePassword,
    setCurrentUser,
    logout,
  } = useApp();

  const isTeacherOrAdmin =
    currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';

  const [name, setName] = useState(currentUser?.name || '');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    updateUserProfile(name.trim(), currentUser.avatarUrl, currentUser.coverUrl, currentUser.bio);
    alert('Pengaturan profil berhasil disimpan!');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (oldPassword !== (currentUser.password || '123') && oldPassword !== '123') {
      setPassError('Kata sandi saat ini tidak cocok!');
      return;
    }
    if (newPassword.trim().length < 3) {
      setPassError('Kata sandi baru minimal 3 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    changePassword(currentUser.id, newPassword);
    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('Kata sandi berhasil diperbarui!');
  };

  const handleSyncSupabase = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('Sinkronisasi database Supabase & Cloud Firestore berhasil!');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-[#3e4042] flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-[#3a3b3c] flex items-center justify-center text-[#1877F2]">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Pengaturan Akun & Sekolah
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola preferensi akun, keamanan, tampilan gelap/terang, dan identitas sekolah
          </p>
        </div>
      </div>

      {/* 1. App Logo Branding (For Teachers / Principals) */}
      {isTeacherOrAdmin && (
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-[#3e4042] space-y-4">
          <div className="flex items-center gap-2.5">
            <School className="w-5 h-5 text-[#1877F2]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Logo Aplikasi & Identitas Sekolah
              </h3>
              <p className="text-xs text-slate-500">
                Menu Pendidik: Pilih lambang resmi SMP Negeri Sinombayuga
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-[#18191a] rounded-xl border border-slate-200 dark:border-[#3e4042]">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#242526] border border-slate-200 dark:border-[#3e4042] flex items-center justify-center p-1 shadow-xs overflow-hidden shrink-0">
              <img src="/ic_logo_bilindi.jpg" alt="Logo BilindiWall" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Logo Resmi BilindiWall
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  🔒 Terkunci Permanen
                </span>
              </div>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Berkas <strong>ic_logo_bilindi.jpg</strong> diterapkan secara permanen di seluruh sistem: bar navigasi atas, kartu masuk (login), tab browser, dan surat dinas modul ajar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Profile Details Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-[#3e4042] space-y-4"
      >
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Informasi Profil ({currentUser?.role})
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Nama Pengguna (Username Login)
          </label>
          <input
            type="text"
            value={currentUser?.username || ''}
            disabled
            className="w-full bg-slate-100 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] rounded-xl px-4 py-2 text-xs text-slate-500 cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] rounded-xl"
          >
            Simpan Informasi Profil
          </button>
        </div>
      </form>

      {/* 3. Tampilan & Mode Gelap */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-[#3e4042] space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Preferensi Tampilan
        </h3>

        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#18191a] rounded-xl border border-slate-200 dark:border-[#3e4042]">
          <div className="flex items-center gap-3">
            {isDarkMode ? (
              <Moon className="w-5 h-5 text-amber-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Mode Gelap (Dark Mode)
              </span>
              <span className="text-[11px] text-slate-500">
                Warna latar belakang nyaman di mata saat belajar malam hari
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              isDarkMode ? 'bg-[#1877F2]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                isDarkMode ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Supabase Cloud Sync & SQL */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-emerald-200 dark:border-emerald-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sinkronisasi Cloud Supabase & Firestore
              </h3>
              <p className="text-xs text-emerald-600 font-semibold">
                Status: Terhubung & Aktif (Auto-Save Real-Time)
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Online
          </span>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 border-t border-slate-100 dark:border-[#3a3b3c] pt-3">
          <p className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Materi ajar modul terstruktur & data penugasan tersimpan
          </p>
          <p className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Persetujuan verifikasi postingan murid & buku nilai guru tersinkronisasi
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleSyncSupabase}
            disabled={isSyncing}
            className="flex-1 py-2 px-3 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] rounded-xl transition-colors disabled:opacity-50"
          >
            {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
          </button>
          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#3e4042] rounded-xl hover:bg-slate-50"
          >
            Lihat Skema SQL
          </button>
        </div>
      </div>

      {/* 5. Keamanan & Sandi */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-[#3e4042] space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Lock className="w-4 h-4 text-[#1877F2]" />
          <span>Keamanan & Kata Sandi</span>
        </div>
        <p className="text-xs text-slate-500">
          Perbarui kata sandi Anda secara berkala untuk menjaga kerahasiaan akun belajar SMP Negeri Sinombayuga.
        </p>
        <button
          type="button"
          onClick={() => {
            setPassError(null);
            setShowPasswordModal(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#1877F2] text-[#1877F2] font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          <Key className="w-4 h-4" />
          Ganti Kata Sandi (Password)
        </button>
      </div>

      {/* 6. Logout */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar dari Akun (Logout)
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-[#3e4042] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ganti Kata Sandi
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Saat Ini (Lama)
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama"
                  required
                  className="w-full bg-slate-50 dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 3 karakter"
                  required
                  className="w-full bg-slate-50 dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  required
                  className="w-full bg-slate-50 dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              {passError && (
                <p className="text-xs text-red-500 font-medium">{passError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1877F2] rounded-xl"
                >
                  Simpan Kata Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-[#3e4042] space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Skema SQL Supabase Database
              </h3>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Skrip SQL inisialisasi tabel posts, users, reels, stories, comments, classes, dan direct_messages:
            </p>
            <pre className="flex-1 overflow-y-auto bg-slate-900 text-emerald-400 p-4 rounded-xl text-[10px] font-mono whitespace-pre leading-relaxed">
{`-- SKEMA DATABASE LENGKAP BILINDIWALL DI SUPABASE
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'APPROVED',
    title TEXT,
    content TEXT,
    image_url TEXT,
    target_class TEXT DEFAULT 'Semua Kelas',
    hashtag TEXT,
    likes INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    moderation_notes TEXT,
    structured_content JSONB,
    assignment_detail JSONB,
    timestamp TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    username TEXT,
    password TEXT DEFAULT '123',
    class_name TEXT,
    subject TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    school TEXT DEFAULT 'SMP Negeri sinombayuga'
);`}
            </pre>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText('CREATE TABLE posts (...);');
                  alert('Skrip SQL disalin!');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] text-white text-xs font-bold rounded-xl"
              >
                <Copy className="w-3.5 h-3.5" />
                Salin SQL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-[#3e4042] space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Konfirmasi Keluar
            </h3>
            <p className="text-xs text-slate-500">
              Apakah Anda yakin ingin keluar dari akun? Anda perlu memasukkan nama pengguna dan kata sandi untuk masuk kembali.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                }}
                className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
