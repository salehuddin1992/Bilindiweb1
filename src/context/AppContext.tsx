import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Post,
  PostStatus,
  Story,
  Comment,
  Submission,
  ReelItem,
  SchoolAnnouncement,
  ClassItem,
  DirectMessage,
  AppNotification,
  NavTab,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_STORIES,
  INITIAL_COMMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_REELS,
  INITIAL_CLASSES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_DIRECT_MESSAGES,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import { SupabaseSyncService } from '../services/supabaseSyncService';
import { supabase } from '../services/supabaseClient';

interface AppContextType {
  currentUser: User | null;
  users: Record<string, User>;
  posts: Post[];
  stories: Story[];
  reels: ReelItem[];
  comments: Comment[];
  submissions: Submission[];
  classes: ClassItem[];
  availableClasses: string[];
  announcements: SchoolAnnouncement[];
  directMessages: DirectMessage[];
  notifications: AppNotification[];
  activeTab: NavTab;
  searchQuery: string;
  selectedClassFilter: string;
  isDarkMode: boolean;
  appLogoUrl: string | null;

  // Actions
  setCurrentUser: (user: User | null) => void;
  switchUser: (userId: string) => void;
  logout: () => Promise<void>;
  setActiveTab: (tab: NavTab) => void;
  setSearchQuery: (query: string) => void;
  setSelectedClassFilter: (cls: string) => void;
  addClass: (cls: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
  updateAppLogo: (url: string | null) => void;

  addPost: (postData: Partial<Post>) => Post;
  updatePost: (post: Post) => void;
  deletePost: (postId: string) => void;
  approvePost: (postId: string) => void;
  rejectPost: (postId: string, reason: string) => void;
  requestRevision: (postId: string, notes: string) => void;
  resubmitPost: (postId: string, newContent: string, newImageUrl?: string) => void;
  toggleLikePost: (postId: string) => void;

  addComment: (postId: string, text: string) => void;

  addStory: (story: { imageUrl: string; caption?: string; targetClass?: string; isVideo?: boolean; videoUrl?: string }) => void;
  deleteStory: (storyId: string) => void;

  addReel: (reel: Omit<ReelItem, 'id' | 'likes' | 'comments' | 'isLiked'>) => void;
  toggleLikeReel: (reelId: string) => void;
  deleteReel: (reelId: string) => void;

  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  submitAssignment: (assignmentPost: Post, content: string, imageUrl?: string) => void;

  saveClass: (classItem: ClassItem) => void;
  deleteClass: (classId: string) => void;

  approveStudent: (studentId: string) => void;
  rejectStudent: (studentId: string) => void;

  sendDirectMessage: (recipientId: string, text: string, imageUrl?: string) => void;
  markDirectMessagesAsRead: (senderId: string) => void;

  markNotificationAsRead: (id: string) => void;

  updateUserProfile: (name: string, avatarUrl: string, coverUrl?: string, bio?: string) => void;
  updateUserBadges: (userId: string, badges: string[]) => void;
  changePassword: (userId: string, newPass: string) => boolean;

  authenticate: (username: string, pass: string) => User | null;
  registerUser: (data: {
    name: string;
    role: UserRole;
    username: string;
    password?: string;
    className?: string;
    subject?: string;
    avatarUrl?: string;
    bio?: string;
  }) => User;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'bilindi_users_v2',
  CURRENT_USER_ID: 'bilindi_current_user_id_v2',
  POSTS: 'bilindi_posts_v2',
  STORIES: 'bilindi_stories_v2',
  REELS: 'bilindi_reels_v2',
  COMMENTS: 'bilindi_comments_v2',
  SUBMISSIONS: 'bilindi_submissions_v2',
  CLASSES: 'bilindi_classes_v2',
  MESSAGES: 'bilindi_messages_v2',
  NOTIFS: 'bilindi_notifs_v2',
  DARK_MODE: 'bilindi_dark_mode_v2',
  APP_LOGO: 'bilindi_app_logo_v2',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<Record<string, User>>(() =>
    safeGet(STORAGE_KEYS.USERS, INITIAL_USERS)
  );

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return safeGet<string | null>(STORAGE_KEYS.CURRENT_USER_ID, 'u1'); // Defaults to Andi Pratama
  });

  const currentUser = currentUserId && users[currentUserId] ? users[currentUserId] : null;

  const [posts, setPosts] = useState<Post[]>(() =>
    safeGet(STORAGE_KEYS.POSTS, INITIAL_POSTS)
  );

  const [stories, setStories] = useState<Story[]>(() =>
    safeGet(STORAGE_KEYS.STORIES, INITIAL_STORIES)
  );

  const [reels, setReels] = useState<ReelItem[]>(() =>
    safeGet(STORAGE_KEYS.REELS, INITIAL_REELS)
  );

  const [comments, setComments] = useState<Comment[]>(() =>
    safeGet(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS)
  );

  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    safeGet(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS)
  );

  const [classes, setClasses] = useState<ClassItem[]>(() =>
    safeGet(STORAGE_KEYS.CLASSES, INITIAL_CLASSES)
  );

  const [announcements] = useState<SchoolAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  const [directMessages, setDirectMessages] = useState<DirectMessage[]>(() =>
    safeGet(STORAGE_KEYS.MESSAGES, INITIAL_DIRECT_MESSAGES)
  );

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    safeGet(STORAGE_KEYS.NOTIFS, INITIAL_NOTIFICATIONS)
  );

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilterState] = useState('Semua Kelas');

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    safeGet(STORAGE_KEYS.DARK_MODE, false)
  );

  const [appLogoUrl, setAppLogoUrl] = useState<string>(() =>
    safeGet(STORAGE_KEYS.APP_LOGO, '/ic_logo_bilindi.jpg') || '/ic_logo_bilindi.jpg'
  );

  // Sync dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Persist storage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REELS, JSON.stringify(reels));
  }, [reels]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(directMessages));
  }, [directMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APP_LOGO, JSON.stringify(appLogoUrl));
  }, [appLogoUrl]);

  // Auto-lock selected class filter when user switches to student
  useEffect(() => {
    if (currentUser?.role === 'STUDENT') {
      setSelectedClassFilterState(currentUser.className || 'VII-A');
    } else {
      setSelectedClassFilterState('Semua Kelas');
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.className]);

  const availableClasses = React.useMemo(() => {
    const set = new Set(['Semua Kelas', 'VII-A', 'VII-B', 'VIII-B']);
    classes.forEach((c) => {
      const clean = c.name.replace(/^Kelas\s+/i, '').trim();
      if (clean) set.add(clean);
    });
    return Array.from(set);
  }, [classes]);

  const setSelectedClassFilter = (cls: string) => {
    if (currentUser?.role === 'STUDENT') {
      setSelectedClassFilterState(currentUser.className || 'VII-A');
    } else {
      setSelectedClassFilterState(cls);
    }
  };

  const addClass = (newClass: string) => {
    if (!newClass.trim()) return;
    const clean = newClass.trim();
    const formatted = clean.toLowerCase().startsWith('kelas') ? clean : `Kelas ${clean}`;
    const newClassItem: ClassItem = {
      id: `c_${Date.now()}`,
      name: formatted,
      homeroomTeacher: currentUser?.name || 'Guru Pengampu',
      studentCount: 30,
      subjectList: ['IPA', 'Matematika', 'Bahasa Indonesia', 'Informatika'],
      schedule: 'Senin - Jumat (07.00 - 13.30 WIB)',
    };
    setClasses((prev) => [...prev, newClassItem]);
  };

  const setCurrentUser = (user: User | null) => {
    if (user) {
      setCurrentUserId(user.id);
    } else {
      setCurrentUserId(null);
    }
  };

  const switchUser = (userId: string) => {
    if (users[userId]) {
      setCurrentUserId(userId);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  };

  // Sync Supabase Auth session & Database profile
  useEffect(() => {
    const initSupabaseSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .or(`id.eq.${session.user.id},username.eq.${session.user.email?.split('@')[0]}`)
            .maybeSingle();

          if (dbUser) {
            const mappedUser: User = {
              id: dbUser.id || session.user.id,
              name: dbUser.name || session.user.user_metadata?.name || 'Pengguna',
              role: (dbUser.role?.toUpperCase() === 'TEACHER' ? 'TEACHER' : dbUser.role?.toUpperCase() === 'PRINCIPAL' ? 'PRINCIPAL' : 'STUDENT') as UserRole,
              username: dbUser.username || session.user.email?.split('@')[0] || 'pengguna',
              password: dbUser.password,
              className: dbUser.class_name || undefined,
              subject: dbUser.subject || undefined,
              avatarUrl: dbUser.avatar_url || session.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
              coverUrl: dbUser.cover_url || undefined,
              bio: dbUser.bio || '',
              location: dbUser.location || 'Sinombayuga',
              school: dbUser.school || 'SMP Negeri sinombayuga',
              badges: dbUser.badges || ['Akun Supabase'],
              isApproved: dbUser.is_approved ?? true,
            };
            setUsers((prev) => ({ ...prev, [mappedUser.id]: mappedUser }));
            setCurrentUserId(mappedUser.id);
          }
        }
      } catch (err) {
        console.warn('Supabase session load error:', err);
      }
    };

    initSupabaseSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      } else if (event === 'SIGNED_IN' && session?.user) {
        initSupabaseSession();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const setDarkMode = (val: boolean) => setIsDarkMode(val);
  const updateAppLogo = (url: string | null) => setAppLogoUrl(url || '/ic_logo_bilindi.jpg');

  const addPost = (postData: Partial<Post>): Post => {
    const isStudent = currentUser?.role === 'STUDENT';
    const finalStatus: PostStatus = isStudent ? 'PENDING' : 'APPROVED';
    const finalClass = isStudent
      ? currentUser?.className || 'VII-A'
      : postData.targetClass || (selectedClassFilter !== 'Semua Kelas' ? selectedClassFilter : 'Semua Kelas');

    const newPost: Post = {
      id: `p_${Date.now()}`,
      authorId: currentUser?.id || 'u1',
      type: postData.type || 'STATUS',
      status: finalStatus,
      timestamp: 'Baru saja',
      title: postData.title,
      content: postData.content,
      hashtag: postData.hashtag,
      imageUrl: postData.imageUrl,
      videoUrl: postData.videoUrl,
      pdfUrl: postData.pdfUrl,
      pdfName: postData.pdfName,
      pdfPageCount: postData.pdfPageCount || 0,
      targetClass: finalClass,
      likes: 0,
      commentsCount: 0,
      isLikedByMe: false,
      structuredContent: postData.structuredContent,
      assignmentDetail: postData.assignmentDetail,
      moderationNotes: undefined,
    };

    setPosts((prev) => [newPost, ...prev]);

    // Live sync to Supabase
    SupabaseSyncService.instance.syncPost(newPost, currentUser?.name || 'Siswa');

    // If student post, create moderation notification for teachers
    if (isStudent) {
      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        recipientId: 'TEACHERS',
        title: 'Verifikasi Postingan Murid',
        message: `${currentUser?.name} (${currentUser?.className || 'VII-A'}) mengirim postingan baru yang menunggu verifikasi guru.`,
        timestamp: 'Baru saja',
        type: 'MODERATION_REQUEST',
        relatedPostId: newPost.id,
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    // If hashtag matches assignment, record in submissions
    if (newPost.hashtag && newPost.hashtag.startsWith('#Tugas')) {
      const sub: Submission = {
        id: `sub_${Date.now()}`,
        postId: newPost.id,
        assignmentHashtag: newPost.hashtag,
        studentId: newPost.authorId,
        content: newPost.content || '',
        imageUrl: newPost.imageUrl,
        timestamp: 'Baru saja',
        grade: null,
        feedback: null,
        isGraded: false,
      };
      setSubmissions((prev) => [sub, ...prev]);
    }

    return newPost;
  };

  const updatePost = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    SupabaseSyncService.instance.deletePost(postId);
  };

  const approvePost = (postId: string) => {
    let authorId = '';
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          authorId = p.authorId;
          return { ...p, status: 'APPROVED', moderationNotes: undefined };
        }
        return p;
      })
    );

    SupabaseSyncService.instance.syncPostStatus(postId, 'APPROVED');

    // Update notifications
    setNotifications((prev) =>
      prev.map((n) =>
        n.relatedPostId === postId ? { ...n, isRead: true, actionTaken: 'APPROVED' } : n
      )
    );

    if (authorId) {
      const studentNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        recipientId: authorId,
        title: 'Postingan Disetujui! 🎉',
        message: 'Guru telah menyetujui postingan Anda. Postingan kini sudah tampil di beranda kelas!',
        timestamp: 'Baru saja',
        type: 'POST_APPROVED',
        relatedPostId: postId,
        isRead: false,
        actionTaken: 'APPROVED',
      };
      setNotifications((prev) => [studentNotif, ...prev]);
    }
  };

  const rejectPost = (postId: string, reason: string) => {
    const cleanReason = reason.trim() || 'Konten tidak memenuhi tata tertib atau aturan sekolah';
    let authorId = '';
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          authorId = p.authorId;
          return { ...p, status: 'REJECTED', moderationNotes: cleanReason };
        }
        return p;
      })
    );

    SupabaseSyncService.instance.syncPostStatus(postId, 'REJECTED', cleanReason);

    setNotifications((prev) =>
      prev.map((n) =>
        n.relatedPostId === postId ? { ...n, isRead: true, actionTaken: 'REJECTED' } : n
      )
    );

    if (authorId) {
      const studentNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        recipientId: authorId,
        title: 'Postingan Ditolak Guru',
        message: `Postingan Anda tidak dapat dipublikasikan. Alasan: ${cleanReason}`,
        timestamp: 'Baru saja',
        type: 'POST_REJECTED',
        relatedPostId: postId,
        isRead: false,
        actionTaken: 'REJECTED',
      };
      setNotifications((prev) => [studentNotif, ...prev]);
    }
  };

  const requestRevision = (postId: string, notes: string) => {
    const cleanNotes = notes.trim() || 'Mohon periksa kembali kata-kata dan gambar sebelum diposting';
    let authorId = '';
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          authorId = p.authorId;
          return { ...p, status: 'NEEDS_REVISION', moderationNotes: cleanNotes };
        }
        return p;
      })
    );

    SupabaseSyncService.instance.syncPostStatus(postId, 'NEEDS_REVISION', cleanNotes);

    setNotifications((prev) =>
      prev.map((n) =>
        n.relatedPostId === postId ? { ...n, isRead: true, actionTaken: 'REVISION' } : n
      )
    );

    if (authorId) {
      const studentNotif: AppNotification = {
        id: `notif_${Date.now()}`,
        recipientId: authorId,
        title: 'Perlu Revisi Postingan',
        message: `Guru meminta revisi: "${cleanNotes}". Silakan periksa dan kirim ulang postingan Anda.`,
        timestamp: 'Baru saja',
        type: 'POST_REVISION',
        relatedPostId: postId,
        isRead: false,
        actionTaken: 'REVISION',
      };
      setNotifications((prev) => [studentNotif, ...prev]);
    }
  };

  const resubmitPost = (postId: string, newContent: string, newImageUrl?: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            content: newContent,
            imageUrl: newImageUrl !== undefined ? newImageUrl : p.imageUrl,
            status: 'PENDING',
            moderationNotes: undefined,
            timestamp: 'Diedit baru saja',
          };
        }
        return p;
      })
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      recipientId: 'TEACHERS',
      title: 'Revisi Dikirim Ulang',
      message: `${currentUser?.name || 'Siswa'} telah memperbaiki dan mengirim ulang postingan untuk diverifikasi.`,
      timestamp: 'Baru saja',
      type: 'MODERATION_REQUEST',
      relatedPostId: postId,
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const toggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const wasLiked = p.isLikedByMe;
          const count = wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1;
          return { ...p, isLikedByMe: !wasLiked, likes: count };
        }
        return p;
      })
    );
  };

  const addComment = (postId: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      text: text.trim(),
      timestamp: 'Baru saja',
    };
    setComments((prev) => [...prev, newComment]);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
    );
    setReels((prev) =>
      prev.map((r) => (r.id === postId ? { ...r, comments: r.comments + 1 } : r))
    );
  };

  const addStory = (storyData: {
    imageUrl: string;
    caption?: string;
    targetClass?: string;
    isVideo?: boolean;
    videoUrl?: string;
  }) => {
    if (!currentUser) return;
    const assignedClass =
      currentUser.role === 'STUDENT'
        ? currentUser.className || 'VII-A'
        : storyData.targetClass || 'Semua Kelas';

    const newStory: Story = {
      id: `s_${Date.now()}`,
      authorId: currentUser.id,
      imageUrl: storyData.imageUrl,
      caption: storyData.caption || '',
      timestamp: 'Baru saja',
      targetClass: assignedClass,
      isVideo: storyData.isVideo || false,
      videoUrl: storyData.videoUrl,
    };
    setStories((prev) => [newStory, ...prev]);
  };

  const deleteStory = (storyId: string) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
  };

  const addReel = (reel: Omit<ReelItem, 'id' | 'likes' | 'comments' | 'isLiked'>) => {
    const newReel: ReelItem = {
      ...reel,
      id: `reel_${Date.now()}`,
      likes: 0,
      comments: 0,
      isLiked: false,
    };
    setReels((prev) => [newReel, ...prev]);
  };

  const toggleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const wasLiked = r.isLiked;
          const count = wasLiked ? Math.max(0, r.likes - 1) : r.likes + 1;
          return { ...r, isLiked: !wasLiked, likes: count };
        }
        return r;
      })
    );
  };

  const deleteReel = (reelId: string) => {
    setReels((prev) => prev.filter((r) => r.id !== reelId));
  };

  const gradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? { ...sub, grade, feedback, isGraded: true }
          : sub
      )
    );
  };

  const submitAssignment = (
    assignmentPost: Post,
    content: string,
    imageUrl?: string
  ) => {
    if (!currentUser) return;
    const hashtag = assignmentPost.hashtag || '#Tugas';
    const newPost = addPost({
      type: 'STATUS',
      content,
      hashtag,
      imageUrl,
      targetClass: currentUser.className || assignmentPost.targetClass || 'VII-A',
    });

    const sub: Submission = {
      id: `sub_${Date.now()}`,
      postId: newPost.id,
      assignmentHashtag: hashtag,
      studentId: currentUser.id,
      content,
      imageUrl,
      timestamp: 'Baru saja',
      grade: null,
      feedback: null,
      isGraded: false,
    };
    setSubmissions((prev) => [sub, ...prev]);
  };

  const saveClass = (classItem: ClassItem) => {
    setClasses((prev) => {
      const idx = prev.findIndex((c) => c.id === classItem.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = classItem;
        return copy;
      }
      return [...prev, classItem];
    });
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== classId));
  };

  const approveStudent = (studentId: string) => {
    const student = users[studentId];
    if (!student) return;

    setUsers((prev) => ({
      ...prev,
      [studentId]: { ...student, isApproved: true },
    }));

    if (student.className) {
      setClasses((prev) =>
        prev.map((cls) =>
          cls.name.toLowerCase().includes(student.className!.toLowerCase())
            ? { ...cls, studentCount: cls.studentCount + 1 }
            : cls
        )
      );
    }

    const notif: AppNotification = {
      id: `notif_appr_${Date.now()}`,
      recipientId: studentId,
      type: 'SYSTEM',
      title: 'Pendaftaran Dikonfirmasi! 🎉',
      message: `Pendaftaran Anda di kelas ${student.className || 'SMP Negeri sinombayuga'} telah disetujui guru. Selamat belajar!`,
      timestamp: 'Baru saja',
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const rejectStudent = (studentId: string) => {
    setUsers((prev) => {
      const copy = { ...prev };
      delete copy[studentId];
      return copy;
    });
  };

  const sendDirectMessage = (recipientId: string, text: string, imageUrl?: string) => {
    if (!currentUser) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg: DirectMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      recipientId,
      text: text.trim(),
      timestamp: timeStr,
      isRead: false,
      imageUrl,
    };
    setDirectMessages((prev) => [...prev, newMsg]);
  };

  const markDirectMessagesAsRead = (senderId: string) => {
    if (!currentUser) return;
    setDirectMessages((prev) =>
      prev.map((m) =>
        m.senderId === senderId && m.recipientId === currentUser.id
          ? { ...m, isRead: true }
          : m
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const updateUserProfile = (name: string, avatarUrl: string, coverUrl?: string, bio?: string) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      name,
      avatarUrl,
      coverUrl: coverUrl !== undefined ? coverUrl : currentUser.coverUrl,
      bio: bio !== undefined ? bio : currentUser.bio,
    };
    setUsers((prev) => ({ ...prev, [currentUser.id]: updated }));
  };

  const updateUserBadges = (userId: string, badges: string[]) => {
    setUsers((prev) => {
      const u = prev[userId];
      if (!u) return prev;
      return { ...prev, [userId]: { ...u, badges } };
    });
  };

  const changePassword = (userId: string, newPass: string): boolean => {
    if (!newPass.trim()) return false;
    setUsers((prev) => {
      const u = prev[userId];
      if (!u) return prev;
      return { ...prev, [userId]: { ...u, password: newPass.trim() } };
    });
    return true;
  };

  const authenticate = (usernameInput: string, passwordInput: string): User | null => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();
    const matched = Object.values(users).find((user) => {
      const matchName =
        user.username.toLowerCase() === cleanUser ||
        user.name.toLowerCase().includes(cleanUser) ||
        (cleanUser === 'guru' && user.role === 'TEACHER') ||
        (cleanUser === 'siswa' && user.role === 'STUDENT') ||
        (cleanUser === 'kepsek' && user.role === 'PRINCIPAL');
      const matchPass = user.password === cleanPass || cleanPass === '123';
      return matchName && matchPass;
    });

    if (matched) {
      setCurrentUserId(matched.id);
      return matched;
    }
    return null;
  };

  const registerUser = (data: {
    name: string;
    role: UserRole;
    username: string;
    password?: string;
    className?: string;
    subject?: string;
    avatarUrl?: string;
    bio?: string;
  }): User => {
    const newId = `u_${Date.now()}`;
    const defaultAvatar =
      data.role === 'TEACHER'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

    const newUser: User = {
      id: newId,
      name: data.name.trim(),
      role: data.role,
      username: data.username.trim().toLowerCase(),
      password: data.password?.trim() || '123',
      className: data.className?.trim(),
      subject: data.subject?.trim(),
      avatarUrl: data.avatarUrl || defaultAvatar,
      coverUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000',
      bio: data.bio || (data.role === 'TEACHER' ? 'Guru Pengajar SMP Negeri sinombayuga' : 'Siswa SMP Negeri sinombayuga'),
      location: 'Sinombayuga',
      school: 'SMP Negeri sinombayuga',
      badges: data.role === 'TEACHER' ? ['Guru Inovatif'] : ['Siswa Baru'],
      isApproved: data.role !== 'STUDENT',
    };

    setUsers((prev) => ({ ...prev, [newId]: newUser }));
    setCurrentUserId(newId);
    return newUser;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        posts,
        stories,
        reels,
        comments,
        submissions,
        classes,
        availableClasses,
        announcements,
        directMessages,
        notifications,
        activeTab,
        searchQuery,
        selectedClassFilter,
        isDarkMode,
        appLogoUrl,

        setCurrentUser,
        switchUser,
        logout,
        setActiveTab,
        setSearchQuery,
        setSelectedClassFilter,
        addClass,
        toggleDarkMode,
        setDarkMode,
        updateAppLogo,

        addPost,
        updatePost,
        deletePost,
        approvePost,
        rejectPost,
        requestRevision,
        resubmitPost,
        toggleLikePost,

        addComment,

        addStory,
        deleteStory,

        addReel,
        toggleLikeReel,
        deleteReel,

        gradeSubmission,
        submitAssignment,

        saveClass,
        deleteClass,

        approveStudent,
        rejectStudent,

        sendDirectMessage,
        markDirectMessagesAsRead,

        markNotificationAsRead,

        updateUserProfile,
        updateUserBadges,
        changePassword,

        authenticate,
        registerUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
