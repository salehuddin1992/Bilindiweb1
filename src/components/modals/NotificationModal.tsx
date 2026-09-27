import React, { useState } from 'react';
import {
  X,
  Shield,
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit,
  Send,
  Radio,
  FileCheck,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, AppNotification } from '../../types';

interface NotificationModalProps {
  onDismiss: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onDismiss }) => {
  const {
    currentUser,
    posts,
    users,
    notifications,
    announcements,
    approvePost,
    rejectPost,
    requestRevision,
    resubmitPost,
    markNotificationAsRead,
  } = useApp();

  const isTeacherOrAdmin =
    currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';

  const [activeTab, setActiveTab] = useState<'moderation' | 'notifications' | 'announcements'>(
    'moderation'
  );

  // Rejection sub-modal state
  const [rejectingPost, setRejectingPost] = useState<Post | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Revision sub-modal state
  const [revisingPost, setRevisingPost] = useState<Post | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Student Resubmit sub-modal state
  const [resubmittingPost, setResubmittingPost] = useState<Post | null>(null);
  const [resubmitContent, setResubmitContent] = useState('');

  const pendingPosts = posts.filter((p) => p.status === 'PENDING');
  const studentMyPosts = posts.filter((p) => p.authorId === currentUser?.id);

  const userNotifications = notifications.filter(
    (n) =>
      n.recipientId === currentUser?.id ||
      (n.recipientId === 'TEACHERS' && isTeacherOrAdmin) ||
      n.recipientId === 'ALL'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="relative flex flex-col w-full max-w-2xl h-[88vh] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1877F2] text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
              {isTeacherOrAdmin ? <Shield className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold">
                {isTeacherOrAdmin ? 'Verifikasi Murid & Notifikasi' : 'Notifikasi & Status Postingan'}
              </h2>
              <p className="text-xs text-blue-100">
                {isTeacherOrAdmin
                  ? 'Perlindungan Siswa: Cegah perundungan (bullying) & konten tidak pantas'
                  : 'Pantau status persetujuan kiriman belajar Anda'}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center border-b border-slate-200 dark:border-[#3e4042] bg-slate-50 dark:bg-[#18191a] text-xs font-semibold px-4">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'moderation'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {isTeacherOrAdmin ? 'Verifikasi Postingan' : 'Status Kiriman'}
            {isTeacherOrAdmin && pendingPosts.length > 0 && (
              <span className="bg-red-500 text-white rounded-full px-1.5 py-0.2 text-[10px]">
                {pendingPosts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Notifikasi Masuk
            {userNotifications.filter((n) => !n.isRead).length > 0 && (
              <span className="bg-red-500 text-white rounded-full px-1.5 py-0.2 text-[10px]">
                {userNotifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'announcements'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Pengumuman Sekolah
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: MODERATION / POST STATUS */}
          {activeTab === 'moderation' && (
            <>
              {isTeacherOrAdmin ? (
                <div className="space-y-4">
                  {/* Safety Policy Banner */}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                    <Shield className="w-5 h-5 text-[#1877F2] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Protokol Keamanan Sekolah:</strong> Setiap postingan murid wajib ditinjau oleh guru untuk memastikan lingkungan belajar ramah anak, bebas dari pornografi, ujaran kebencian, dan perundungan.
                    </div>
                  </div>

                  {pendingPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 mb-3">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                        Semua Postingan Murid Telah Diverifikasi
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Tidak ada kiriman siswa yang menunggu persetujuan saat ini.
                      </p>
                    </div>
                  ) : (
                    pendingPosts.map((post) => {
                      const author = users[post.authorId];
                      return (
                        <div
                          key={post.id}
                          className="bg-white dark:bg-[#18191a] border-2 border-amber-400 rounded-xl p-4 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src={author?.avatarUrl}
                                alt={author?.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-300"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {author?.name || 'Siswa'}
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Kelas {author?.className || 'VII-A'} · {post.timestamp}
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Menunggu Verifikasi
                            </span>
                          </div>

                          <div className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-[#242526] p-3 rounded-lg border border-slate-200 dark:border-[#3e4042]">
                            {post.title && <h5 className="font-bold mb-1">{post.title}</h5>}
                            {post.content && <p className="leading-relaxed">{post.content}</p>}
                            {post.hashtag && (
                              <p className="text-[#1877F2] font-semibold mt-1">{post.hashtag}</p>
                            )}
                            {post.imageUrl && (
                              <img
                                src={post.imageUrl}
                                alt="Lampiran"
                                className="w-full h-44 object-cover rounded-md mt-2 border border-slate-200 dark:border-[#3e4042]"
                              />
                            )}
                          </div>

                          {/* Moderation Action Buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => approvePost(post.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Setujui (Tayang)
                            </button>
                            <button
                              onClick={() => {
                                setRevisingPost(post);
                                setRevisionNotes('');
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                            >
                              <Edit className="w-4 h-4" />
                              Minta Revisi
                            </button>
                            <button
                              onClick={() => {
                                setRejectingPost(post);
                                setRejectReason('');
                              }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                            >
                              <XCircle className="w-4 h-4" />
                              Tolak
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                /* Student View of their own posts */
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200">
                    Setiap postingan Anda ditinjau oleh guru pengampu sebelum diterbitkan di Dinding Kelas untuk menjamin ruang belajar yang aman.
                  </div>

                  {studentMyPosts.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      Anda belum membagikan postingan apa pun.
                    </div>
                  ) : (
                    studentMyPosts.map((post) => {
                      const isPending = post.status === 'PENDING';
                      const isRejected = post.status === 'REJECTED';
                      const isRevision = post.status === 'NEEDS_REVISION';
                      const isApproved = post.status === 'APPROVED';

                      return (
                        <div
                          key={post.id}
                          className={`p-3.5 rounded-xl border text-xs bg-white dark:bg-[#18191a] space-y-2 ${
                            isApproved
                              ? 'border-emerald-300 dark:border-emerald-900'
                              : isPending
                              ? 'border-amber-300 dark:border-amber-900'
                              : isRevision
                              ? 'border-amber-400 bg-amber-50/40'
                              : 'border-red-300 dark:border-red-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">{post.timestamp}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                isApproved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800'
                                  : isRevision
                                  ? 'bg-amber-200 text-amber-900'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isApproved
                                ? '✓ Disetujui Guru'
                                : isPending
                                ? '⏳ Menunggu Verifikasi'
                                : isRevision
                                ? '⚠️ Perlu Revisi'
                                : '✕ Ditolak Guru'}
                            </span>
                          </div>

                          <p className="text-slate-800 dark:text-slate-200 font-medium">
                            {post.content || post.title || '(Tanpa teks)'}
                          </p>

                          {post.moderationNotes && (
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
                              <span className="font-bold block">Catatan Guru:</span>
                              {post.moderationNotes}
                            </div>
                          )}

                          {isRevision && (
                            <button
                              onClick={() => {
                                setResubmittingPost(post);
                                setResubmitContent(post.content || '');
                              }}
                              className="w-full py-2 bg-[#1877F2] text-white rounded-lg font-bold hover:bg-[#166fe5] transition-colors"
                            >
                              Perbaiki Postingan & Kirim Ulang
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-2.5">
              {userNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Tidak ada notifikasi baru saat ini.
                </div>
              ) : (
                userNotifications.map((notif: AppNotification) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      !notif.isRead
                        ? 'bg-blue-50/70 dark:bg-[#242526] border-blue-200 dark:border-[#1877F2]'
                        : 'bg-white dark:bg-[#18191a] border-slate-200 dark:border-[#3e4042]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-[#3a3b3c] flex items-center justify-center text-[#1877F2] shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-[#3e4042] bg-white dark:bg-[#18191a] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {ann.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-[#1877F2] font-semibold">{ann.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#3e4042] bg-slate-50 dark:bg-[#18191a] flex justify-end">
          <button
            onClick={onDismiss}
            className="px-5 py-2 text-xs font-bold bg-slate-200 dark:bg-[#3a3b3c] text-slate-800 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-[#4e4f50] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Sub-modal: Tolak Postingan */}
      {rejectingPost && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl p-5 space-y-4 shadow-2xl border border-red-300">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm">Tolak Postingan Murid</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Pilih alasan penolakan pelanggaran aturan sekolah:
            </p>

            <div className="space-y-1.5">
              {[
                'Konten Tidak Pantas / Pornografi',
                'Indikasi Perundungan (Bullying)',
                'Ujaran Kebencian / Kata-kata Kasar',
                'Di Luar Konteks Pembelajaran Sekolah',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full text-left p-2 rounded-lg text-xs font-medium border transition-colors ${
                    rejectReason === reason
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-slate-200 dark:border-[#3e4042] text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                  }`}
                >
                  ⛔ {reason}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Atau tulis alasan spesifik lainnya..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-[#3e4042] bg-white dark:bg-[#3a3b3c] text-slate-900 dark:text-white resize-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingPost(null)}
                className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  rejectPost(rejectingPost.id, rejectReason);
                  setRejectingPost(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal: Minta Revisi */}
      {revisingPost && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl p-5 space-y-4 shadow-2xl border border-amber-300">
            <div className="flex items-center gap-2 text-amber-600">
              <Edit className="w-5 h-5" />
              <h3 className="font-bold text-sm">Minta Siswa Memperbaiki Postingan</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Tulis catatan arahan perbaikan agar siswa dapat memperbaiki postingannya:
            </p>

            <div className="space-y-1.5">
              {[
                'Gunakan bahasa yang lebih sopan dan runtut',
                'Lengkapi foto dokumentasi praktik percobaan',
                'Sertakan hashtag tugas resmi (#TugasIPA7Gerhana)',
              ].map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => setRevisionNotes(note)}
                  className={`w-full text-left p-2 rounded-lg text-xs font-medium border transition-colors ${
                    revisionNotes === note
                      ? 'bg-amber-50 border-amber-500 text-amber-800'
                      : 'border-slate-200 dark:border-[#3e4042] text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                  }`}
                >
                  💡 {note}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder="Tuliskan catatan perbaikan..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-[#3e4042] bg-white dark:bg-[#3a3b3c] text-slate-900 dark:text-white resize-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRevisingPost(null)}
                className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  requestRevision(revisingPost.id, revisionNotes);
                  setRevisingPost(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Kirim Permintaan Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal: Siswa Edit & Kirim Ulang */}
      {resubmittingPost && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#242526] rounded-2xl p-5 space-y-4 shadow-2xl border border-blue-300">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Perbaiki Postingan Anda
            </h3>
            {resubmittingPost.moderationNotes && (
              <div className="p-2.5 bg-amber-50 rounded-lg text-xs text-amber-900">
                <span className="font-bold block">Catatan Guru:</span>
                {resubmittingPost.moderationNotes}
              </div>
            )}
            <textarea
              rows={4}
              value={resubmitContent}
              onChange={(e) => setResubmitContent(e.target.value)}
              placeholder="Tuliskan teks yang telah diperbaiki..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-[#3e4042] bg-white dark:bg-[#3a3b3c] text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResubmittingPost(null)}
                className="px-3 py-1.5 text-xs text-slate-600 rounded-lg hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resubmitPost(resubmittingPost.id, resubmitContent);
                  setResubmittingPost(null);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] rounded-lg"
              >
                Kirim Ulang ke Guru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
