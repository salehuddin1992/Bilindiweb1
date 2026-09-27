import React, { useState } from 'react';
import {
  Camera,
  Edit,
  School,
  MapPin,
  Award,
  Sparkles,
  Check,
  X,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1000',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1000',
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
];

const ALL_AVAILABLE_BADGES = [
  'Rajin',
  'Kreatif',
  'Bintang Sains',
  'Sportif',
  'Duta Literasi',
  'Inovator Media',
  'Guru Berprestasi',
  'Kepemimpinan',
  'Aktif Berdiskusi',
];

export const ProfileView: React.FC = () => {
  const { currentUser, posts, users, updateUserProfile, updateUserBadges } = useApp();

  const [showEditBioModal, setShowEditBioModal] = useState(false);
  const [bioInput, setBioInput] = useState(currentUser?.bio || '');

  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    currentUser?.badges || []
  );

  const userPosts = posts.filter((p) => p.authorId === currentUser?.id);

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    updateUserProfile(currentUser.name, currentUser.avatarUrl, currentUser.coverUrl, bioInput.trim());
    setShowEditBioModal(false);
  };

  const handleSaveBadges = () => {
    if (!currentUser) return;
    updateUserBadges(currentUser.id, selectedBadges);
    setShowBadgeModal(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full pb-16">
      {/* 1. Facebook Style Cover & Avatar Header */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-slate-200 dark:border-[#3e4042] overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 w-full bg-slate-800">
          <img
            src={currentUser?.coverUrl || PRESET_COVERS[0]}
            alt="Sampul Profil"
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => setShowCoverModal(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            Ubah Sampul
          </button>
        </div>

        {/* Avatar & Identity Box */}
        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar with Camera badge */}
            <div className="relative w-28 sm:w-36 h-28 sm:h-36 rounded-full border-4 border-white dark:border-[#242526] overflow-hidden shadow-lg bg-white shrink-0 group">
              <img
                src={currentUser?.avatarUrl}
                alt={currentUser?.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAvatarModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Ganti Foto
              </button>
              <button
                onClick={() => {
                  setBioInput(currentUser?.bio || '');
                  setShowEditBioModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-[#3a3b3c] hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Bio
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="mt-4 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {currentUser?.name}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#1877F2]">
              {currentUser?.role === 'TEACHER'
                ? `Guru Pengampu · ${currentUser.subject || 'IPA'}`
                : currentUser?.role === 'PRINCIPAL'
                ? 'Kepala Sekolah SMP Negeri Sinombayuga'
                : `Siswa Kelas ${currentUser?.className || 'VII-A'}`}
            </p>
          </div>

          {/* Bio Box */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Perkenalan Diri:
            </span>
            <p className="text-slate-600 dark:text-slate-300 italic">
              "{currentUser?.bio || 'Selalu semangat belajar hal baru setiap hari!'}"
            </p>
          </div>

          {/* School & Location Info */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042]">
              <School className="w-4 h-4 text-[#1877F2]" />
              <span>Belajar di {currentUser?.school || 'SMP Negeri sinombayuga'}</span>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042]">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Tinggal di {currentUser?.location || 'Sinombayuga'}</span>
            </div>
          </div>

          {/* Achievement Badges (Lencana Prestasi) */}
          <div className="mt-5 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Lencana Prestasi & Karakter Siswa
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedBadges(currentUser?.badges || []);
                  setShowBadgeModal(true);
                }}
                className="text-xs font-bold text-[#1877F2] hover:underline"
              >
                Kelola Lencana
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {currentUser?.badges?.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                >
                  <Sparkles className="w-3 h-3" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. User Published Posts Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white px-1">
          Postingan Saya ({userPosts.length})
        </h3>

        {userPosts.length === 0 ? (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 text-center border border-slate-200 dark:border-[#3e4042] text-slate-500 text-xs">
            Belum ada postingan yang Anda bagikan di BilindiWall.
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={currentUser || undefined}
            />
          ))
        )}
      </div>

      {/* Edit Bio Modal */}
      {showEditBioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-[#3e4042] space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Edit Bio Profil
            </h3>
            <textarea
              rows={3}
              value={bioInput}
              onChange={(e) => setBioInput(e.target.value)}
              placeholder="Tuliskan perkenalan singkat tentang dirimu..."
              className="w-full bg-slate-50 dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl p-3 text-xs text-slate-900 dark:text-white resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowEditBioModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBio}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1877F2] rounded-xl"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Picker Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-[#3e4042] space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pilih Gambar Sampul Baru
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESET_COVERS.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      updateUserProfile(currentUser.name, currentUser.avatarUrl, url, currentUser.bio);
                    }
                    setShowCoverModal(false);
                  }}
                  className="h-24 rounded-xl overflow-hidden border-2 border-transparent hover:border-[#1877F2] transition-all"
                >
                  <img src={url} alt="Sampul" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowCoverModal(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-[#3e4042] space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pilih Foto Profil Baru
            </h3>
            <div className="flex items-center justify-center gap-3 py-2">
              {PRESET_AVATARS.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      updateUserProfile(currentUser.name, url, currentUser.coverUrl, currentUser.bio);
                    }
                    setShowAvatarModal(false);
                  }}
                  className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent hover:border-[#1877F2] hover:scale-105 transition-all"
                >
                  <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badges Modal */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-[#3e4042] space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Kelola Lencana Prestasi
            </h3>
            <p className="text-xs text-slate-500">
              Pilih apresiasi karakter dan pencapaian akademik Anda:
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_AVAILABLE_BADGES.map((b) => {
                const isSelected = selectedBadges.includes(b);
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => {
                      setSelectedBadges((prev) =>
                        isSelected ? prev.filter((item) => item !== b) : [...prev, b]
                      );
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#1877F2] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#3a3b3c] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {b}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBadgeModal(false)}
                className="px-4 py-2 text-xs text-slate-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBadges}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1877F2] rounded-xl"
              >
                Terapkan Lencana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
