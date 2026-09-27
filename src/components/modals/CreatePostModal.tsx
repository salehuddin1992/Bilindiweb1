import React, { useState } from 'react';
import { X, Image, Tag, Lock, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CreatePostModalProps {
  initialHashtag?: string;
  onDismiss: () => void;
}

const PRESET_POST_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1532692415740-42f0a149be54?auto=format&fit=crop&q=80&w=800', label: 'Praktik Gerhana' },
  { url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800', label: 'Eksperimen Lab' },
  { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800', label: 'Catatan Rangkuman' },
  { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800', label: 'Laboratorium' },
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  initialHashtag = '',
  onDismiss,
}) => {
  const { currentUser, addPost, availableClasses } = useApp();
  const isStudent = currentUser?.role === 'STUDENT';

  const [content, setContent] = useState('');
  const [hashtag, setHashtag] = useState(initialHashtag);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [targetClass, setTargetClass] = useState(
    isStudent ? currentUser?.className || 'VII-A' : 'Semua Kelas'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;

    let formattedHashtag = hashtag.trim();
    if (formattedHashtag && !formattedHashtag.startsWith('#')) {
      formattedHashtag = `#${formattedHashtag}`;
    }

    addPost({
      type: 'STATUS',
      content: content.trim(),
      hashtag: formattedHashtag || undefined,
      imageUrl: selectedImage || undefined,
      targetClass,
    });

    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#3e4042]">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Buat Postingan Baru
          </h3>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User badge */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatarUrl}
              alt={currentUser?.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#3e4042]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser?.name}
                </span>
                {isStudent ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#1877F2] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Kelas {currentUser.className || 'VII-A'}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    {currentUser?.role === 'PRINCIPAL' ? 'Kepala Sekolah' : 'Guru'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {isStudent
                  ? 'Kiriman akan ditinjau oleh guru untuk keamanan komunitas'
                  : `Target: ${targetClass}`}
              </p>
            </div>
          </div>

          {/* Teacher Target Class selector */}
          {!isStudent && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Ruang Kelas:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {availableClasses.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setTargetClass(cls)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      targetClass === cls
                        ? 'bg-[#1877F2] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#3a3b3c] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Area */}
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis refleksi belajar, hasil eksperimen sains, atau pertanyaan tugas..."
            className="w-full bg-slate-50 dark:bg-[#18191a] text-xs sm:text-sm text-slate-900 dark:text-white p-3.5 rounded-xl border border-slate-300 dark:border-[#3e4042] focus:border-[#1877F2] focus:outline-hidden resize-none"
          />

          {/* Hashtag Field */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#18191a] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-[#3e4042]">
            <Tag className="w-4 h-4 text-[#1877F2] shrink-0" />
            <input
              type="text"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              placeholder="Tagar tugas (misal: #TugasIPA7Gerhana)"
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          {/* Media Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Lampirkan Bukti / Foto Belajar:
              </label>
              {selectedImage && (
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Hapus Foto
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {PRESET_POST_IMAGES.map((item) => {
                const isSelected = selectedImage === item.url;
                return (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => setSelectedImage(isSelected ? null : item.url)}
                    className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-[#1877F2] scale-102 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#1877F2]/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#3e4042]">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!content.trim() && !selectedImage}
              className="px-6 py-2 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors"
            >
              Posting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
