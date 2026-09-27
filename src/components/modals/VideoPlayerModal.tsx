import React from 'react';
import { X, Play, ExternalLink } from 'lucide-react';

interface VideoPlayerModalProps {
  title: string;
  videoUrl: string;
  onDismiss: () => void;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  title,
  videoUrl,
  onDismiss,
}) => {
  const youtubeId = extractYouTubeId(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-3xl bg-black rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#1e293b] text-white">
          <div className="flex items-center gap-2 truncate">
            <Play className="w-4 h-4 text-red-500 fill-current" />
            <h3 className="text-sm font-semibold truncate">{title}</h3>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Canvas */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              Browser Anda tidak mendukung tag video.
            </video>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#0f172a] text-slate-300 text-xs">
          <span>{youtubeId ? 'Memutar langsung dari YouTube' : 'Memutar file video edukasi'}</span>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1 text-[#1877F2] hover:underline"
          >
            Buka di Tab Baru
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
