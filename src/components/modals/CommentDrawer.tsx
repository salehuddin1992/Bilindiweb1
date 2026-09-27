import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Comment, Post, ReelItem } from '../../types';

interface CommentDrawerProps {
  item: Post | ReelItem;
  title?: string;
  onDismiss: () => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  item,
  title = 'Komentar & Diskusi',
  onDismiss,
}) => {
  const { comments, users, currentUser, addComment } = useApp();
  const [commentText, setCommentText] = useState('');

  const itemComments = comments.filter((c) => c.postId === item.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(item.id, commentText);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div className="relative flex flex-col w-full max-w-md h-full bg-white dark:bg-[#242526] shadow-2xl border-l border-slate-200 dark:border-[#3e4042]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#3e4042]">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {itemComments.length} tanggapan santun & edukatif
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {itemComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-6">
              <p className="text-sm font-medium">Belum ada komentar.</p>
              <p className="text-xs mt-1">Jadilah yang pertama membuka diskusi di ruang belajar ini!</p>
            </div>
          ) : (
            itemComments.map((comment: Comment) => {
              const author = users[comment.authorId];
              return (
                <div key={comment.id} className="flex items-start gap-3">
                  <img
                    src={author?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={author?.name || 'User'}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-[#3e4042] shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-slate-100 dark:bg-[#3a3b3c] rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {author?.name || 'Pengguna'}
                        </span>
                        {author?.role === 'TEACHER' && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                            Guru
                          </span>
                        )}
                        {author?.role === 'STUDENT' && author.className && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            · Kelas {author.className}
                          </span>
                        )}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 mt-0.5 inline-block">
                      {comment.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 dark:border-[#3e4042] bg-white dark:bg-[#242526]">
          <div className="flex items-center gap-2">
            <img
              src={currentUser?.avatarUrl}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-[#3e4042] shrink-0"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis komentar santun & edukatif..."
              className="flex-1 bg-slate-100 dark:bg-[#3a3b3c] text-xs text-slate-900 dark:text-white px-4 py-2.5 rounded-full border border-transparent focus:border-[#1877F2] focus:outline-hidden transition-all"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2.5 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
