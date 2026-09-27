import React, { useState } from 'react';
import { X, Image, Video, Check, Upload, Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupabaseSyncService } from '../../services/supabaseSyncService';

interface StoryCreateModalProps {
  onDismiss: () => void;
}

const PRESET_STORY_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80', label: 'Diskusi Belajar' },
  { url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80', label: 'Presentasi Kelas' },
  { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80', label: 'Praktik Lab' },
  { url: 'https://images.unsplash.com/photo-1532692415740-42f0a149be54?auto=format&fit=crop&w=400&q=80', label: 'Eksperimen Sains' },
];

const PRESET_STORY_VIDEOS = [
  { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', label: 'Simulasi Sains' },
  { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', label: 'Aktivitas Kelas' },
];

export const StoryCreateModal: React.FC<StoryCreateModalProps> = ({ onDismiss }) => {
  const { currentUser, addStory, availableClasses } = useApp();
  const isStudent = currentUser?.role === 'STUDENT';

  const [isVideo, setIsVideo] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(PRESET_STORY_IMAGES[0].url);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState('Aktivitas belajar hari ini ✨');
  const [targetClass, setTargetClass] = useState(
    isStudent ? currentUser?.className || 'VII-A' : 'Semua Kelas'
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv)$/i.test(file.name);
    setIsVideo(isVid);
    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      const url = await SupabaseSyncService.instance.uploadMedia(file, 'stories');
      setSelectedMedia(url);
      if (isVid) {
        setVideoUrl(url);
      }
    } catch (err) {
      console.error('Gagal mengunggah file cerita:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedia || isUploading) return;

    addStory({
      imageUrl: selectedMedia,
      caption: caption.trim(),
      targetClass,
      isVideo,
      videoUrl: isVideo ? videoUrl || selectedMedia : undefined,
    });

    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#3e4042] shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Buat Cerita Baru</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isStudent ? `Terkunci untuk Kelas: ${currentUser?.className || 'VII-A'}` : `Target: ${targetClass}`}
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Unggah Berkas Utama dari Galeri / Komputer */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border-2 border-dashed border-[#1877F2]/40 rounded-2xl text-center space-y-2">
            <input
              type="file"
              id="story-file-upload"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <label
              htmlFor="story-file-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-sm transition-all active:scale-95"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Berkas...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Unggah Foto / Video dari Komputer / Galeri</span>
                </>
              )}
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Mendukung file gambar (.jpg, .png, .webp) & video (.mp4, .webm, .mov)
            </p>
            {uploadedFileName && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold rounded-full mt-1">
                <Check className="w-3.5 h-3.5" />
                <span className="truncate max-w-xs">{uploadedFileName} ({isVideo ? 'Video' : 'Foto'})</span>
              </div>
            )}
          </div>

          {/* Media Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-[#18191a] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setIsVideo(false);
                if (!uploadedFileName) setSelectedMedia(PRESET_STORY_IMAGES[0].url);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                !isVideo
                  ? 'bg-white dark:bg-[#242526] text-[#1877F2] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Image className="w-4 h-4" />
              Foto Cerita
            </button>
            <button
              type="button"
              onClick={() => {
                setIsVideo(true);
                if (!uploadedFileName) {
                  setSelectedMedia(PRESET_STORY_VIDEOS[0].url);
                  setVideoUrl(PRESET_STORY_VIDEOS[0].url);
                }
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                isVideo
                  ? 'bg-white dark:bg-[#242526] text-red-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Video className="w-4 h-4" />
              Video Cerita
            </button>
          </div>

          {/* Target class for teacher */}
          {!isStudent && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Ruang Kelas:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {availableClasses.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setTargetClass(cls)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      targetClass === cls
                        ? 'bg-[#1877F2] text-white'
                        : 'bg-slate-100 dark:bg-[#3a3b3c] text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Preview Canvas */}
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-300 dark:border-[#3e4042] flex items-center justify-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-[#1877F2]" />
                <span className="text-xs">Mengunggah media ke sistem...</span>
              </div>
            ) : isVideo ? (
              <video src={selectedMedia} className="w-full h-full object-cover" muted autoPlay loop controls />
            ) : (
              <img src={selectedMedia} alt="Preview Cerita" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 pointer-events-none">
              <span className="text-white text-xs font-medium truncate">
                {caption || 'Pratinjau cerita Anda...'}
              </span>
            </div>
          </div>

          {/* Presets Gallery */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Atau Pilih dari Contoh Media Sekolah:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(isVideo ? PRESET_STORY_VIDEOS : PRESET_STORY_IMAGES).map((item) => {
                const isSelected = selectedMedia === item.url && !uploadedFileName;
                return (
                  <button
                    key={item.url}
                    type="button"
                    onClick={() => {
                      setUploadedFileName(null);
                      setSelectedMedia(item.url);
                      if (isVideo) setVideoUrl(item.url);
                    }}
                    className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-[#1877F2] scale-102 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isVideo ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                    )}
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

          {/* Caption Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Keterangan Cerita:
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tuliskan kegiatan belajarmu hari ini..."
              className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#1877F2] focus:outline-hidden"
            />
          </div>

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
              disabled={isUploading || !selectedMedia}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 ${
                isVideo ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1877F2] hover:bg-[#166fe5]'
              }`}
            >
              {isUploading ? 'Sedang Mengunggah...' : isVideo ? 'Bagikan Video ke Cerita' : 'Bagikan Foto ke Cerita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
