import React, { useState } from 'react';
import {
  Shield,
  Clock,
  CheckCircle,
  FileCheck,
  Megaphone,
  MessageSquare,
  Users,
  AlertCircle,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationModal } from '../modals/NotificationModal';
import { CreatePostModal } from '../modals/CreatePostModal';
import { Post } from '../../types';

export const RightSidebar: React.FC = () => {
  const {
    currentUser,
    users,
    posts,
    announcements,
    approvePost,
    setActiveTab,
  } = useApp();

  const isTeacherOrAdmin =
    currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState<Post | null>(null);

  // Pending posts for teacher moderation
  const pendingPosts = posts.filter((p) => p.status === 'PENDING');

  // Pending students for teacher confirmation
  const pendingStudents = Object.values(users).filter(
    (u) => u.role === 'STUDENT' && !u.isApproved
  );

  // Active assignments for students
  const activeAssignments = posts.filter((p) => p.type === 'ASSIGNMENT');

  // Online contacts (teachers & students)
  const onlineContacts = Object.values(users).filter((u) => u.id !== currentUser?.id);

  return (
    <>
      <aside className="space-y-4 text-xs">
        {/* 1. TEACHER: Moderation Queue Widget */}
        {isTeacherOrAdmin && (
          <div className="bg-white dark:bg-[#242526] rounded-2xl border border-amber-300 dark:border-amber-800 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Verifikasi Postingan Murid
                </h4>
              </div>
              {pendingPosts.length > 0 && (
                <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                  {pendingPosts.length}
                </span>
              )}
            </div>

            {pendingPosts.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">
                Semua postingan murid telah terverifikasi aman.
              </p>
            ) : (
              <div className="space-y-2.5">
                {pendingPosts.slice(0, 2).map((post) => {
                  const author = users[post.authorId];
                  return (
                    <div
                      key={post.id}
                      className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {author?.name || 'Siswa'} ({author?.className || 'VII-A'})
                        </span>
                        <span className="text-[10px] text-amber-700 font-semibold shrink-0">
                          {post.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                        {post.content || post.title || '(Foto/Media)'}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => approvePost(post.id)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors"
                        >
                          ✓ Setujui (Tayang)
                        </button>
                        <button
                          onClick={() => setShowNotificationModal(true)}
                          className="py-1.5 px-2 bg-slate-200 dark:bg-[#3a3b3c] hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg font-medium text-[10px]"
                        >
                          Tinjau
                        </button>
                      </div>
                    </div>
                  );
                })}

                {pendingPosts.length > 2 && (
                  <button
                    onClick={() => setShowNotificationModal(true)}
                    className="w-full text-center text-[#1877F2] font-bold text-[11px] hover:underline"
                  >
                    Lihat semua ({pendingPosts.length} postingan) →
                  </button>
                )}
              </div>
            )}

            {/* Pending Student Registrations banner */}
            {pendingStudents.length > 0 && (
              <div
                onClick={() => setActiveTab('classes')}
                className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <Users className="w-4 h-4 text-[#1877F2] shrink-0" />
                  <span className="font-semibold text-blue-900 dark:text-blue-200 text-[11px] truncate">
                    {pendingStudents.length} siswa baru menunggu konfirmasi
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#1877F2] shrink-0">Buka →</span>
              </div>
            )}
          </div>
        )}

        {/* 2. STUDENT: Upcoming Deadlines & Homework Widget */}
        {!isTeacherOrAdmin && (
          <div className="bg-white dark:bg-[#242526] rounded-2xl border border-slate-200 dark:border-[#3e4042] p-4 space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Tugas & Batas Waktu
              </h4>
            </div>

            {activeAssignments.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">
                Tidak ada tenggat tugas dalam waktu dekat.
              </p>
            ) : (
              <div className="space-y-2.5">
                {activeAssignments.slice(0, 3).map((asg) => (
                  <div
                    key={asg.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {asg.title}
                      </span>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                        {asg.assignmentDetail?.deadline || 'Besok'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{asg.content}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-bold text-[#1877F2]">
                        {asg.hashtag}
                      </span>
                      <button
                        onClick={() => setSubmittingAssignment(asg)}
                        className="px-2.5 py-1 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg font-bold text-[10px] transition-colors"
                      >
                        Kumpulkan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Pengumuman Resmi Sekolah */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-slate-200 dark:border-[#3e4042] p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#1877F2]" />
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Kabar Sekolah
            </h4>
          </div>

          <div className="space-y-2">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {ann.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">{ann.date}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Kontak Sekolah Online (Guru & Teman Sekelas) */}
        <div className="bg-white dark:bg-[#242526] rounded-2xl border border-slate-200 dark:border-[#3e4042] p-4 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Warga Sekolah Aktif
              </h4>
            </div>
            <span className="text-[10px] text-slate-400">
              {onlineContacts.length} online
            </span>
          </div>

          <div className="space-y-1">
            {onlineContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setActiveTab('messenger')}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#3a3b3c] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="relative">
                    <img
                      src={contact.avatarUrl}
                      alt={contact.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-slate-900 dark:text-white block truncate text-[11px]">
                      {contact.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {contact.role === 'TEACHER'
                        ? `Guru · ${contact.subject || 'IPA'}`
                        : contact.role === 'PRINCIPAL'
                        ? 'Kepala Sekolah'
                        : `Siswa · Kelas ${contact.className || 'VII-A'}`}
                    </span>
                  </div>
                </div>

                <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Copyright & Identity */}
        <div className="px-2 text-[10px] text-slate-400 space-y-1">
          <p>BilindiWall · Belajar Interaktif Digital</p>
          <p>© 2026 SMP Negeri Sinombayuga</p>
        </div>
      </aside>

      {/* Notification Modal */}
      {showNotificationModal && (
        <NotificationModal onDismiss={() => setShowNotificationModal(false)} />
      )}

      {/* Student Submit Homework Modal */}
      {submittingAssignment && (
        <CreatePostModal
          initialHashtag={submittingAssignment.hashtag || '#Tugas'}
          onDismiss={() => setSubmittingAssignment(null)}
        />
      )}
    </>
  );
};
