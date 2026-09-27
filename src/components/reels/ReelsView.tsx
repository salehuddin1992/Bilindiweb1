import React, { useState } from 'react';
import {
  Play,
  Pause,
  Heart,
  MessageCircle,
  Share2,
  Video,
  Plus,
  X,
  MoreVertical,
  Trash2,
  Edit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReelItem } from '../../types';
import { CommentDrawer } from '../modals/CommentDrawer';

export const ReelsView: React.FC = () => {
  const { currentUser, reels, users, toggleLikeReel, addReel, deleteReel } = useApp();
  const isTeacherOrAdmin =
    currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';

  const [playingId, setPlayingId] = useState<string | null>(reels[0]?.id || null);
  const [commentReel, setCommentReel] = useState<ReelItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);

  // New reel state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('IPA Fisika');
  const [newDuration, setNewDuration] = useState('0:45');
  const [newDescription, setNewDescription] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );
  const [newThumbnail, setNewThumbnail] = useState(
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800'
  );

  const handleCreateReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addReel({
      authorId: currentUser?.id || 'u3',
      title: newTitle.trim(),
      subject: newSubject.trim(),
      description: newDescription.trim(),
      duration: newDuration.trim(),
      thumbnailUrl: newThumbnail,
      isVideo: true,
      videoUrl: newVideoUrl,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-[#3e4042] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md">
            <Play className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Reels Edukasi & Simulasi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Video pembelajaran ringkas & eksplorasi sains interaktif
            </p>
          </div>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Buat Reel Baru
          </button>
        )}
      </div>

      {/* Reels List */}
      <div className="space-y-6">
        {reels.map((reel) => {
          const author = users[reel.authorId];
          const isPlaying = playingId === reel.id;

          return (
            <div
              key={reel.id}
              className="relative w-full h-[520px] rounded-3xl overflow-hidden bg-black shadow-lg border border-slate-800 group"
            >
              {/* Video Player / Media */}
              {reel.isVideo && reel.videoUrl ? (
                <video
                  src={reel.videoUrl}
                  loop
                  autoPlay={isPlaying}
                  controls={false}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

              {/* Top Subject & Duration Pill */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#1877F2]/90 text-white shadow-xs">
                  {reel.subject}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-black/50 text-white">
                  {reel.duration}
                </span>
              </div>

              {/* Play / Pause Toggle Center Button */}
              <button
                onClick={() => setPlayingId(isPlaying ? null : reel.id)}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all z-10"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              {/* Teacher options */}
              {isTeacherOrAdmin && (
                <button
                  onClick={() => {
                    if (confirm(`Hapus reel "${reel.title}"?`)) {
                      deleteReel(reel.id);
                    }
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-red-600 text-white transition-colors z-10"
                  title="Hapus Reel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Bottom Author & Title Info */}
              <div className="absolute bottom-4 left-4 right-16 z-10 text-white space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <img
                    src={author?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={author?.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white"
                  />
                  <div>
                    <h4 className="text-xs font-bold leading-tight drop-shadow-sm">
                      {author?.name || 'Pendidik'}
                    </h4>
                    <span className="text-[10px] text-white/80">Guru SMP Negeri Sinombayuga</span>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold leading-snug drop-shadow-sm line-clamp-2">
                  {reel.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {reel.description}
                </p>
              </div>

              {/* Vertical Action Column on Right */}
              <div className="absolute bottom-6 right-3 z-10 flex flex-col items-center gap-4 text-white">
                {/* Like */}
                <button
                  onClick={() => toggleLikeReel(reel.id)}
                  className="flex flex-col items-center gap-1 group/btn"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                      reel.isLiked ? 'bg-red-600 text-white' : 'bg-black/50 group-hover/btn:bg-black/70'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${reel.isLiked ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-xs font-bold">{reel.likes}</span>
                </button>

                {/* Comment */}
                <button
                  onClick={() => setCommentReel(reel)}
                  className="flex flex-col items-center gap-1 group/btn"
                >
                  <div className="w-11 h-11 rounded-full bg-black/50 group-hover/btn:bg-black/70 flex items-center justify-center transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">{reel.comments}</span>
                </button>

                {/* Share */}
                <button
                  onClick={() => alert(`Tautan Reel '${reel.title}' disalin!`)}
                  className="flex flex-col items-center gap-1 group/btn"
                >
                  <div className="w-11 h-11 rounded-full bg-black/50 group-hover/btn:bg-black/70 flex items-center justify-center transition-all">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold">Bagikan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reel Comments Drawer */}
      {commentReel && (
        <CommentDrawer
          item={commentReel}
          title={`Diskusi: ${commentReel.title}`}
          onDismiss={() => setCommentReel(null)}
        />
      )}

      {/* Create Reel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#3e4042]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Buat Reel Edukasi Baru
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Video / Topik Reel
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="cth: Eksperimen Reaksi Fotosintesis"
                  required
                  className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="IPA Fisika / Biologi"
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Durasi Video
                  </label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="0:45"
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi Ringkas Materi
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Poin utama konsep yang dijelaskan dalam video..."
                  className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl p-3 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL Video (.mp4)
                </label>
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#3e4042]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
                >
                  Terbitkan Reel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
