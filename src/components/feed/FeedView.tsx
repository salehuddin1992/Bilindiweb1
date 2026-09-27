import React, { useState } from 'react';
import {
  Megaphone,
  BookOpen,
  ClipboardList,
  Image,
  Tag,
  Smile,
  X,
  SearchX,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from './PostCard';
import { StoryCarousel } from './StoryCarousel';
import { CreatePostModal } from '../modals/CreatePostModal';
import { TeacherCreateModal } from '../modals/TeacherCreateModal';
import { ClassFilterBar } from '../common/ClassFilterBar';
import { Post } from '../../types';

export const FeedView: React.FC = () => {
  const {
    currentUser,
    posts,
    users,
    announcements,
    searchQuery,
    selectedClassFilter,
  } = useApp();

  const isTeacherOrAdmin =
    currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';

  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'Materi' | 'Tugas' | 'Siswa'>(
    'Semua'
  );
  const [activeHashtagFilter, setActiveHashtagFilter] = useState<string | null>(null);

  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherModalTab, setTeacherModalTab] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Filter posts based on class, search, category, hashtag, and moderation safety
  const filteredPosts = posts.filter((post) => {
    const author = users[post.authorId];
    const postClass =
      post.targetClass ||
      post.assignmentDetail?.targetClass ||
      author?.className ||
      'Semua Kelas';

    // 1. Class Filter
    const matchesClass =
      currentUser?.role === 'STUDENT'
        ? postClass.toLowerCase() === (currentUser.className || 'VII-A').toLowerCase() ||
          (author?.role === 'STUDENT' &&
            author.className?.toLowerCase() === (currentUser.className || 'VII-A').toLowerCase()) ||
          postClass === 'Semua Kelas' ||
          author?.role === 'PRINCIPAL'
        : selectedClassFilter === 'Semua Kelas' || !selectedClassFilter
        ? true
        : postClass.toLowerCase() === selectedClassFilter.toLowerCase() ||
          (author?.role === 'STUDENT' &&
            author.className?.toLowerCase() === selectedClassFilter.toLowerCase()) ||
          postClass === 'Semua Kelas' ||
          author?.role === 'PRINCIPAL';

    // 2. Search Query
    const matchesSearch = !searchQuery.trim()
      ? true
      : (post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (post.hashtag?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (author?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    // 3. Category Filter
    const matchesCategory =
      selectedCategory === 'Materi'
        ? post.type === 'LEARNING'
        : selectedCategory === 'Tugas'
        ? post.type === 'ASSIGNMENT'
        : selectedCategory === 'Siswa'
        ? post.type === 'STATUS' && author?.role === 'STUDENT'
        : true;

    // 4. Hashtag Filter
    const matchesHashtag = !activeHashtagFilter
      ? true
      : post.hashtag?.toLowerCase() === activeHashtagFilter.toLowerCase();

    // 5. Moderation Visibility (Approved posts visible to all; pending/rejected/revision only to author or teachers)
    const matchesModeration =
      post.status === 'APPROVED'
        ? true
        : post.authorId === currentUser?.id || isTeacherOrAdmin;

    return matchesClass && matchesSearch && matchesCategory && matchesHashtag && matchesModeration;
  });

  return (
    <div className="space-y-4 max-w-2xl mx-auto w-full pb-10">
      {/* 1. Stories Carousel */}
      <StoryCarousel />

      {/* 2. Class Filter Bar (Locked for student, interactive selector for teacher) */}
      <ClassFilterBar />

      {/* 3. School Announcement Banner */}
      {announcements.length > 0 && announcements[0] && (
        <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 shadow-sm border border-amber-200 dark:border-amber-900/60 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Pengumuman: {announcements[0].title}
              </span>
              <span className="text-[11px] text-[#1877F2] font-semibold">
                {announcements[0].date}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {announcements[0].content}
            </p>
          </div>
        </div>
      )}

      {/* 3. Create Post Trigger Card */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-[#3e4042] space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={currentUser?.avatarUrl}
            alt={currentUser?.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#3e4042] shrink-0"
          />
          <button
            onClick={() => setShowCreatePostModal(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-full bg-slate-100 dark:bg-[#3a3b3c] hover:bg-slate-200 dark:hover:bg-[#4e4f50] text-slate-500 dark:text-slate-300 text-xs sm:text-sm transition-colors truncate"
          >
            {isTeacherOrAdmin
              ? `Bagikan modul, tugas, atau info belajar, ${currentUser?.name.split(' ')[0]}?`
              : `Apa yang ingin kamu pelajari hari ini, ${currentUser?.name.split(' ')[0]}?`}
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-[#3a3b3c] flex items-center justify-between gap-1">
          {isTeacherOrAdmin ? (
            <>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setTeacherModalTab(0);
                  setShowTeacherModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-[#1877F2] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>+ Modul Ajar</span>
              </button>
              <button
                onClick={() => {
                  setEditingPost(null);
                  setTeacherModalTab(1);
                  setShowTeacherModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                <span>+ Tugas Asesmen</span>
              </button>
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <Image className="w-4 h-4" />
                <span>+ Foto / Info</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
              >
                <Image className="w-4 h-4 text-emerald-500" />
                <span>Bukti Tugas</span>
              </button>
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
              >
                <Tag className="w-4 h-4 text-[#1877F2]" />
                <span>Topik</span>
              </button>
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
              >
                <Smile className="w-4 h-4 text-amber-500" />
                <span>Diskusi</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 4. Active Hashtag Filter indicator */}
      {activeHashtagFilter && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-[#1877F2]">
          <span className="font-bold">Menampilkan kiriman dengan tagar: {activeHashtagFilter}</span>
          <button
            onClick={() => setActiveHashtagFilter(null)}
            className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-[#1877F2]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs">
        {(['Semua', 'Materi', 'Tugas', 'Siswa'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-[#1877F2] text-white shadow-xs'
                : 'bg-white dark:bg-[#242526] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] border border-slate-200 dark:border-[#3e4042]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 6. Post List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-slate-200 dark:border-[#3e4042] text-slate-500 dark:text-slate-400 space-y-2">
            <SearchX className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">
              Tidak ada postingan yang sesuai filter
            </h4>
            <p className="text-xs">
              Coba ganti kategori, hapus kata kunci pencarian, atau pilih filter kelas lainnya.
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={users[post.authorId]}
              onEdit={() => {
                setEditingPost(post);
                setShowTeacherModal(true);
              }}
              onHashtagClick={(tag) => setActiveHashtagFilter(tag)}
            />
          ))
        )}
      </div>

      {/* Create General Post Modal */}
      {showCreatePostModal && (
        <CreatePostModal
          initialHashtag={activeHashtagFilter || ''}
          onDismiss={() => setShowCreatePostModal(false)}
        />
      )}

      {/* Teacher Create/Edit Modal */}
      {showTeacherModal && (
        <TeacherCreateModal
          initialPost={editingPost}
          initialTab={teacherModalTab}
          onDismiss={() => {
            setShowTeacherModal(false);
            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
};
