import React, { useState } from 'react';
import {
  X,
  Image,
  Video,
  FileText,
  Tag,
  Lock,
  Check,
  Upload,
  Loader2,
  Paperclip,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseSyncService } from '../../services/supabaseSyncService';

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
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string; size?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [targetClass, setTargetClass] = useState(
    isStudent ? currentUser?.className || 'VII-A' : 'Semua Kelas'
  );

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
      const isDoc = file.type.includes('pdf') || /\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i.test(file.name);

      const url = await SupabaseSyncService.instance.uploadMedia(file, isVid ? 'videos' : isDoc ? 'documents' : 'posts');

      if (isVid) {
        setSelectedVideo(url);
        setSelectedImage(null);
        setSelectedFile(null);
      } else if (isDoc) {
        setSelectedFile({
          name: file.name,
          url,
          size: `${(file.size / 1024).toFixed(0)} KB`,
        });
        setSelectedImage(null);
        setSelectedVideo(null);
      } else {
        setSelectedImage(url);
        setSelectedVideo(null);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Gagal mengunggah media:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearAttachments = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage && !selectedVideo && !selectedFile) return;

    let formattedHashtag = hashtag.trim();
    if (formattedHashtag && !formattedHashtag.startsWith('#')) {
      formattedHashtag = `#${formattedHashtag}`;
    }

    addPost({
      type: 'STATUS',
      content: content.trim(),
      hashtag: formattedHashtag || undefined,
      imageUrl: selectedImage || undefined,
      videoUrl: selectedVideo || undefined,
      pdfUrl: selectedFile?.url || undefined,
      pdfName: selectedFile?.name || undefined,
      targetClass,
    });

    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#3e4042] shrink-0">
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
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

          {/* File Attachment & Upload Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Unggah dari Komputer / Galeri:
              </label>
              {(selectedImage || selectedVideo || selectedFile) && (
                <button
                  type="button"
                  onClick={handleClearAttachments}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Hapus Lampiran
                </button>
              )}
            </div>

            {/* Upload Buttons Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Upload Foto/Gambar */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-[#1877F2] dark:text-blue-300 hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-900">
                <Image className="w-4 h-4" />
                <span>Foto / Gambar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMediaUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              {/* Upload Video */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-100 transition-colors border border-red-200 dark:border-red-900">
                <Video className="w-4 h-4" />
                <span>Video (.mp4/.mov)</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleMediaUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>

              {/* Upload Dokumen */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors border border-amber-200 dark:border-amber-900">
                <FileText className="w-4 h-4" />
                <span>Dokumen (PDF/Doc)</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleMediaUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Attachment Preview Card */}
            {isUploading && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[#18191a] rounded-xl border border-slate-200 dark:border-[#3e4042]">
                <Loader2 className="w-4 h-4 animate-spin text-[#1877F2]" />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Mengunggah berkas ke sistem...
                </span>
              </div>
            )}

            {selectedImage && !isUploading && (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-[#3e4042] max-h-56 bg-black flex items-center justify-center">
                <img src={selectedImage} alt="Lampiran postingan" className="w-full h-full max-h-56 object-contain" />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedVideo && !isUploading && (
              <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-[#3e4042] max-h-56 bg-black flex items-center justify-center">
                <video src={selectedVideo} controls className="w-full h-full max-h-56 object-contain" />
                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedFile && !isUploading && (
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#18191a] rounded-xl border border-slate-200 dark:border-[#3e4042]">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {selectedFile.size || 'Dokumen lampiran'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Presets Gallery as optional fallback */}
            {!selectedImage && !selectedVideo && !selectedFile && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  Atau pilih dari koleksi foto sekolah:
                </label>
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
            )}
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
              disabled={isUploading || (!content.trim() && !selectedImage && !selectedVideo && !selectedFile)}
              className="px-6 py-2 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors"
            >
              {isUploading ? 'Mengunggah...' : 'Posting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
