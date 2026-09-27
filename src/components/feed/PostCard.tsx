import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Play,
  FlaskConical,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, User } from '../../types';
import { CommentDrawer } from '../modals/CommentDrawer';
import { PdfPreviewModal } from '../modals/PdfPreviewModal';
import { VideoPlayerModal } from '../modals/VideoPlayerModal';
import { CreatePostModal } from '../modals/CreatePostModal';

interface PostCardProps {
  post: Post;
  author: User | undefined;
  onEdit?: () => void;
  onHashtagClick?: (tag: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  author,
  onEdit,
  onHashtagClick,
}) => {
  const { currentUser, toggleLikePost, deletePost } = useApp();

  const [showComments, setShowComments] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState<{ title: string; file: string } | null>(null);
  const [showVideoModal, setShowVideoModal] = useState<{ title: string; url: string } | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const isAuthor = currentUser?.id === post.authorId;
  const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';
  const isLiked = post.isLikedByMe;

  return (
    <article className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-slate-200 dark:border-[#3e4042] overflow-hidden transition-all hover:shadow-md">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-[#1877F2] text-white text-xs px-4 py-2 text-center font-medium animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Moderation Status Banner (For Author or Teachers) */}
      {post.status === 'PENDING' && (
        <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Menunggu Verifikasi Guru:</strong> Postingan Anda sedang ditinjau sebelum dipublikasikan demi keamanan komunitas belajar.
          </span>
        </div>
      )}

      {post.status === 'NEEDS_REVISION' && (
        <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Perlu Revisi dari Guru:</span>
          </div>
          <p className="ml-6">{post.moderationNotes || 'Mohon periksa dan perbaiki postingan Anda.'}</p>
        </div>
      )}

      {post.status === 'REJECTED' && (
        <div className="px-5 py-2.5 bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-200">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Postingan Ditolak Guru:</span>
          </div>
          <p className="ml-6">{post.moderationNotes || 'Tidak memenuhi tata tertib lingkungan sekolah.'}</p>
        </div>
      )}

      {/* Post Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 pb-3">
        <div className="flex items-center gap-3">
          <img
            src={author?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={author?.name}
            className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-[#3e4042]"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {author?.name || 'Pengguna'}
              </span>

              {/* Role pill */}
              {author?.role === 'TEACHER' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  Guru · {author.subject || 'IPA'}
                </span>
              )}
              {author?.role === 'PRINCIPAL' && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                  Kepala Sekolah
                </span>
              )}
              {author?.role === 'STUDENT' && author.className && (
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#3a3b3c] px-2 py-0.5 rounded-full">
                  Kelas {author.className}
                </span>
              )}

              {/* Target class pill */}
              {post.targetClass && (
                <span className="text-[10px] font-semibold text-[#1877F2] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                  🎯 {post.targetClass}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{post.timestamp}</span>
              <span>·</span>
              <span className="capitalize">{post.type.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Options Dropdown */}
        {(isAuthor || isTeacherOrAdmin) && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-500 transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 z-30 w-36 bg-white dark:bg-[#242526] rounded-xl shadow-lg border border-slate-200 dark:border-[#3e4042] py-1 text-xs">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#3a3b3c]"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Modul
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (confirm('Yakin ingin menghapus postingan ini?')) {
                      deletePost(post.id);
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Kiriman
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Title */}
      {post.title && (
        <h3 className="px-4 sm:px-5 font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
          {post.title}
        </h3>
      )}

      {/* Post Content */}
      {/* 1. Structured Learning Content (4 Segments) */}
      {post.type === 'LEARNING' && post.structuredContent && (
        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Header Banner if present */}
          {post.structuredContent.headerSection?.imageUrl && (
            <img
              src={post.structuredContent.headerSection.imageUrl}
              alt="Banner Materi"
              className="w-full h-48 sm:h-56 object-cover rounded-xl border border-slate-200 dark:border-[#3e4042]"
            />
          )}

          {/* 1. Pemantik */}
          {post.structuredContent.pemantik?.text && (
            <div className="border-l-4 border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-r-xl text-xs space-y-1">
              <span className="font-bold text-amber-900 dark:text-amber-400 block text-xs">
                💡 1. Pertanyaan Pemantik
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed italic">
                "{post.structuredContent.pemantik.text}"
              </p>
            </div>
          )}

          {/* 2. Tujuan */}
          {post.structuredContent.tujuan?.text && (
            <div className="border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 p-3.5 rounded-r-xl text-xs space-y-1">
              <span className="font-bold text-blue-900 dark:text-blue-400 block text-xs">
                🎯 2. Tujuan Pembelajaran
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {post.structuredContent.tujuan.text}
              </p>
            </div>
          )}

          {/* 3. Inti & Media */}
          {post.structuredContent.inti?.text && (
            <div className="border-l-4 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-r-xl text-xs space-y-2.5">
              <span className="font-bold text-emerald-900 dark:text-emerald-400 block text-xs">
                📚 3. Materi Inti & Eksplorasi Konsep
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {post.structuredContent.inti.text}
              </p>

              {/* Media Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {post.structuredContent.inti.embedUrl && (
                  <a
                    href={post.structuredContent.inti.embedUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] text-white rounded-lg text-xs font-bold hover:bg-[#166fe5] shadow-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Simulasi PhET Interaktif
                  </a>
                )}

                {post.structuredContent.inti.videoUrl && (
                  <button
                    onClick={() =>
                      setShowVideoModal({
                        title: post.title || 'Video Pembelajaran',
                        url: post.structuredContent!.inti.videoUrl!,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Putar Video YouTube Langsung
                  </button>
                )}

                {post.structuredContent.inti.pdfName && (
                  <button
                    onClick={() =>
                      setShowPdfModal({
                        title: post.title || 'Modul Ajar',
                        file: post.structuredContent!.inti.pdfName!,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 shadow-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Baca Modul Ajar (PDF)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 4. Asesmen / LKPD */}
          {post.structuredContent.asesmen?.text && (
            <div className="border-l-4 border-purple-500 bg-purple-50/60 dark:bg-purple-950/30 p-3.5 rounded-r-xl text-xs space-y-2">
              <span className="font-bold text-purple-900 dark:text-purple-400 block text-xs">
                📝 4. Asesmen / LKPD Siswa
              </span>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                {post.structuredContent.asesmen.text}
              </p>
              {post.structuredContent.asesmen.pdfName && (
                <button
                  onClick={() =>
                    setShowPdfModal({
                      title: 'LKPD Siswa Formatif',
                      file: post.structuredContent!.asesmen.pdfName!,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 shadow-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Lihat Lembar LKPD Siswa
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Regular Post or Assignment Content */}
      {post.type !== 'LEARNING' && post.content && (
        <p className="px-4 sm:px-5 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Assignment Detail Card */}
      {post.type === 'ASSIGNMENT' && post.assignmentDetail && (
        <div className="mx-4 sm:mx-5 my-2 p-4 bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] rounded-xl text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="font-bold text-red-600 dark:text-red-400">
              ⏰ Batas Pengumpulan: {post.assignmentDetail.deadline}
            </span>
            <span className="font-semibold text-slate-500">
              Kelas: {post.assignmentDetail.targetClass}
            </span>
          </div>

          {post.assignmentDetail.attachmentName && (
            <div className="flex items-center justify-between p-2.5 bg-white dark:bg-[#242526] border border-slate-200 dark:border-[#3e4042] rounded-lg">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-red-600 shrink-0" />
                <span className="font-medium truncate">{post.assignmentDetail.attachmentName}</span>
              </div>
              <button
                onClick={() =>
                  setShowPdfModal({
                    title: post.title || 'Panduan Tugas',
                    file: post.assignmentDetail!.attachmentName!,
                  })
                }
                className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shrink-0 ml-2"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview PDF
              </button>
            </div>
          )}

          {/* Student Submit Assignment CTA */}
          {currentUser?.role === 'STUDENT' && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-sm transition-colors mt-2"
            >
              <Upload className="w-4 h-4" />
              Kumpulkan Tugas (Kirim Bukti Praktik)
            </button>
          )}
        </div>
      )}

      {/* Clickable Hashtag */}
      {post.hashtag && (
        <div className="px-4 sm:px-5 py-1">
          <button
            onClick={() => onHashtagClick?.(post.hashtag!)}
            className="text-xs sm:text-sm font-bold text-[#1877F2] hover:underline"
          >
            {post.hashtag}
          </button>
        </div>
      )}

      {/* Main Image Attachment */}
      {post.imageUrl && (
        <div className="mt-2 w-full bg-slate-100 dark:bg-black">
          <img
            src={post.imageUrl}
            alt="Lampiran"
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* Metrics Row (Likes & Comments count) */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center text-white text-[9px]">
            👍
          </div>
          <span>{post.likes}</span>
        </div>
        <button
          onClick={() => setShowComments(true)}
          className="hover:underline"
        >
          {post.commentsCount} komentar
        </button>
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-4 border-t border-slate-200 dark:border-[#3e4042] px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
        {/* Like */}
        <button
          onClick={() => toggleLikePost(post.id)}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors ${
            isLiked ? 'text-red-500' : ''
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>Suka</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(true)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Komentar</span>
        </button>

        {/* Share */}
        <button
          onClick={() => {
            showToast('Tautan postingan telah disalin ke papan klip!');
          }}
          className="flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Bagikan</span>
        </button>

        {/* Bookmark */}
        <button
          onClick={() => {
            setIsSaved(!isSaved);
            showToast(isSaved ? 'Dihapus dari bookmark belajar' : 'Disimpan ke bookmark belajar!');
          }}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors ${
            isSaved ? 'text-[#1877F2]' : ''
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          <span>Simpan</span>
        </button>
      </div>

      {/* Comment Drawer */}
      {showComments && (
        <CommentDrawer
          item={post}
          onDismiss={() => setShowComments(false)}
        />
      )}

      {/* PDF Preview Modal */}
      {showPdfModal && (
        <PdfPreviewModal
          documentTitle={showPdfModal.title}
          fileName={showPdfModal.file}
          onDismiss={() => setShowPdfModal(null)}
        />
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <VideoPlayerModal
          title={showVideoModal.title}
          videoUrl={showVideoModal.url}
          onDismiss={() => setShowVideoModal(null)}
        />
      )}

      {/* Submit Assignment Modal */}
      {showSubmitModal && (
        <CreatePostModal
          initialHashtag={post.hashtag || '#Tugas'}
          onDismiss={() => setShowSubmitModal(false)}
        />
      )}
    </article>
  );
};
