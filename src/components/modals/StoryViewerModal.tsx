import React, { useState } from 'react';
import { X, Send, Heart, Flame, Sparkles, BookOpen } from 'lucide-react';
import { Story, User } from '../../types';

interface StoryViewerModalProps {
  story: Story;
  author: User | undefined;
  onDismiss: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  author,
  onDismiss,
}) => {
  const [replyText, setReplyText] = useState('');
  const [isReplySent, setIsReplySent] = useState(false);

  const emojis = ['❤️', '👏', '🔥', '💡', '📚', '✨'];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsReplySent(true);
    setReplyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-sm sm:max-w-md h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        {/* Progress Bar / Indicator */}
        <div className="absolute top-3 left-4 right-4 z-20 flex gap-1.5">
          <div className="h-1 flex-1 bg-white/70 rounded-full overflow-hidden">
            <div className="h-full bg-white animate-pulse" />
          </div>
        </div>

        {/* Top Author Bar */}
        <div className="absolute top-6 left-4 right-4 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={author?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={author?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#1877F2]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-tight">
                  {author?.name || 'Siswa'}
                </span>
                {author?.role === 'TEACHER' && (
                  <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.2 rounded">
                    Guru
                  </span>
                )}
              </div>
              <p className="text-[10px] text-white/80">
                {story.timestamp} · 🎯 {story.targetClass || 'Semua Kelas'}
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Canvas */}
        <div className="flex-1 w-full h-full relative flex items-center justify-center bg-black">
          {story.isVideo && story.videoUrl ? (
            <video
              src={story.videoUrl}
              autoPlay
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={story.imageUrl}
              alt={story.caption || 'Cerita'}
              className="w-full h-full object-contain"
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
        </div>

        {/* Bottom Details & Reply Area */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 space-y-3">
          {story.caption && (
            <p className="text-xs sm:text-sm text-white font-medium text-center drop-shadow-sm px-2">
              "{story.caption}"
            </p>
          )}

          {/* Emoji Reactions */}
          <div className="flex items-center justify-center gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIsReplySent(true)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-lg flex items-center justify-center transition-transform hover:scale-115 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply Form */}
          {isReplySent ? (
            <div className="bg-[#1877F2]/90 text-white text-xs font-semibold py-2.5 px-4 rounded-full text-center animate-fade-in">
              ✓ Balasan cerita terkirim ke {author?.name || 'pembuat cerita'}!
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Kirim pesan balasan cerita..."
                className="flex-1 bg-white/20 text-white placeholder-white/60 text-xs px-4 py-2.5 rounded-full border border-white/30 focus:border-white focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#166fe5] disabled:opacity-40 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
