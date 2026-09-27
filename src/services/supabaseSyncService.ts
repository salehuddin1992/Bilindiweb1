import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET_NAME } from './supabaseClient';
import {
  Post,
  PostStatus,
  PostType,
  User,
  UserRole,
  Story,
  Comment,
  Submission,
  ReelItem,
  SchoolAnnouncement,
  ClassItem,
  DirectMessage,
  StructuredLearningContent,
  AssignmentDetail,
} from '../types';

export class SupabaseSyncService {
  private static _instance: SupabaseSyncService;

  public static get instance(): SupabaseSyncService {
    if (!this._instance) {
      this._instance = new SupabaseSyncService();
    }
    return this._instance;
  }

  /**
   * Test connection to Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('posts').select('id').limit(1);
      return !error || error.code === 'PGRST116';
    } catch (e) {
      console.warn('Supabase test connection failed:', e);
      return false;
    }
  }

  /**
   * Helper to convert File to Data URL as fallback if offline/storage unavailable
   */
  static fileToDataUrl(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload media (images, docs, audio, videos) to Supabase Storage with automatic fallback
   */
  async uploadMedia(file: File | Blob, folder = 'uploads'): Promise<string> {
    try {
      let fileExt = 'bin';
      if ('name' in file && typeof file.name === 'string') {
        const parts = file.name.split('.');
        if (parts.length > 1) {
          fileExt = parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, '');
        }
      } else if (file.type) {
        fileExt = file.type.split('/')[1]?.split(';')[0]?.toLowerCase() || 'jpg';
      }

      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `${folder}/${Date.now()}_${randomSuffix}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else if (error) {
        console.warn('Supabase storage upload error, using local data URL fallback:', error.message);
      }
    } catch (e) {
      console.warn('Failed to upload media to Supabase Storage, using fallback:', e);
    }

    // Fallback: convert file to Base64 data URL so upload is never lost
    return await SupabaseSyncService.fileToDataUrl(file);
  }

  /**
   * Sync a single post to Supabase
   */
  async syncPost(post: Post, authorName = 'Pengguna'): Promise<boolean> {
    try {
      const payload = {
        id: post.id,
        author_id: post.authorId,
        type: post.type,
        status: post.status,
        title: post.title || null,
        content: post.content || null,
        image_url: post.imageUrl || null,
        video_url: post.videoUrl || null,
        pdf_url: post.pdfUrl || null,
        pdf_name: post.pdfName || null,
        pdf_page_count: post.pdfPageCount || 0,
        target_class: post.targetClass || 'Semua Kelas',
        hashtag: post.hashtag || null,
        likes: post.likes || 0,
        comments_count: post.commentsCount || 0,
        moderation_notes: post.moderationNotes || null,
        structured_content: post.structuredContent ? JSON.parse(JSON.stringify(post.structuredContent)) : null,
        assignment_detail: post.assignmentDetail ? JSON.parse(JSON.stringify(post.assignmentDetail)) : null,
        timestamp: post.timestamp,
      };

      const { error } = await supabase.from('posts').upsert(payload);
      if (error) {
        console.warn('Error saving post to Supabase:', error.message);
        return false;
      }

      // If student status, record to student posts
      if (post.type === 'STATUS') {
        const studentPayload = {
          murid_id: post.authorId,
          nama_murid: authorName,
          konten_teks: post.content || post.title || 'Postingan Baru',
          media_url: post.imageUrl || post.videoUrl || post.pdfUrl || null,
          tipe_media: post.videoUrl ? 'video' : post.pdfUrl ? 'pdf' : post.imageUrl ? 'image' : null,
        };
        await supabase.from('postingan_murid').insert(studentPayload).select();
      }

      return true;
    } catch (e) {
      console.warn('Exception in syncPost:', e);
      return false;
    }
  }

  /**
   * Sync post approval status & moderation notes
   */
  async syncPostStatus(postId: string, status: PostStatus, moderationNotes: string | null = null): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          status,
          moderation_notes: moderationNotes,
        })
        .eq('id', postId);

      return !error;
    } catch (e) {
      console.warn('Error updating post status:', e);
      return false;
    }
  }

  /**
   * Sync post like
   */
  async syncPostLike(postId: string, likes: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes })
        .eq('id', postId);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('posts').delete().eq('id', postId);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Sync reel video
   */
  async syncReel(reel: ReelItem): Promise<boolean> {
    try {
      const payload = {
        id: reel.id,
        author_id: reel.authorId,
        title: reel.title,
        subject: reel.subject,
        description: reel.description,
        duration: reel.duration,
        thumbnail_url: reel.thumbnailUrl,
        video_url: reel.videoUrl || null,
        is_video: reel.isVideo ?? true,
        likes: reel.likes,
        comments: reel.comments,
      };

      const { error } = await supabase.from('reels').upsert(payload);
      return !error;
    } catch (e) {
      console.warn('Error saving reel to Supabase:', e);
      return false;
    }
  }

  /**
   * Delete reel
   */
  async deleteReel(reelId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('reels').delete().eq('id', reelId);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Sync story
   */
  async syncStory(story: Story): Promise<boolean> {
    try {
      const payload = {
        id: story.id,
        author_id: story.authorId,
        image_url: story.imageUrl,
        video_url: story.videoUrl || null,
        caption: story.caption || '',
        target_class: story.targetClass || null,
        is_video: story.isVideo ?? false,
        timestamp: story.timestamp,
      };

      const { error } = await supabase.from('stories').upsert(payload);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Sync comment
   */
  async syncComment(comment: Comment, authorName: string, authorRole = 'STUDENT'): Promise<boolean> {
    try {
      const payload = {
        id: comment.id,
        post_id: comment.postId,
        author_id: comment.authorId,
        author_name: authorName,
        author_role: authorRole,
        text: comment.text,
        timestamp: comment.timestamp,
      };
      const { error } = await supabase.from('comments').upsert(payload);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Sync student submission
   */
  async syncSubmission(submission: Submission, studentName: string): Promise<boolean> {
    try {
      const payload = {
        id: submission.id,
        assignment_id: submission.postId,
        student_id: submission.studentId,
        student_name: studentName,
        content: submission.content,
        attachment_url: submission.imageUrl || null,
        grade: submission.grade ?? null,
        feedback: submission.feedback || null,
        is_graded: submission.isGraded,
        assignment_hashtag: submission.assignmentHashtag,
        timestamp: submission.timestamp,
      };
      const { error } = await supabase.from('submissions').upsert(payload);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Sync direct message
   */
  async syncDirectMessage(msg: DirectMessage): Promise<boolean> {
    try {
      const payload = {
        id: msg.id,
        sender_id: msg.senderId,
        recipient_id: msg.recipientId,
        text: msg.text,
        timestamp: msg.timestamp,
        is_read: msg.isRead,
        image_url: msg.imageUrl || null,
      };
      const { error } = await supabase.from('direct_messages').upsert(payload);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Sync user profile
   */
  async syncUser(user: User): Promise<boolean> {
    try {
      const payload = {
        id: user.id,
        name: user.name,
        role: user.role,
        username: user.username,
        password: user.password || '123',
        class_name: user.className || null,
        subject: user.subject || null,
        avatar_url: user.avatarUrl,
        cover_url: user.coverUrl || null,
        bio: user.bio || '',
        location: user.location || 'Sinombayuga',
        school: user.school || 'SMP Negeri sinombayuga',
        badges: user.badges || [],
        is_approved: user.isApproved,
      };
      const { error } = await supabase.from('users').upsert(payload);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Sync class item
   */
  async syncClass(classItem: ClassItem): Promise<boolean> {
    try {
      const payload = {
        id: classItem.id,
        name: classItem.name,
        homeroom_teacher: classItem.homeroomTeacher,
        student_count: classItem.studentCount,
        subject_list: classItem.subjectList,
        schedule: classItem.schedule,
      };
      const { error } = await supabase.from('classes').upsert(payload);
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Fetch all remote posts from Supabase
   */
  async fetchPosts(): Promise<Post[]> {
    try {
      const { data, error } = await supabase.from('posts').select('*').order('id', { ascending: false });
      if (error || !data) return [];

      return data.map((obj: any) => ({
        id: obj.id,
        authorId: obj.author_id,
        type: obj.type as PostType,
        status: obj.status as PostStatus,
        title: obj.title || undefined,
        content: obj.content || undefined,
        imageUrl: obj.image_url || undefined,
        videoUrl: obj.video_url || undefined,
        pdfUrl: obj.pdf_url || undefined,
        pdfName: obj.pdf_name || undefined,
        pdfPageCount: obj.pdf_page_count || 0,
        targetClass: obj.target_class || 'Semua Kelas',
        hashtag: obj.hashtag || undefined,
        likes: obj.likes || 0,
        commentsCount: obj.comments_count || 0,
        moderationNotes: obj.moderation_notes || undefined,
        structuredContent: obj.structured_content as StructuredLearningContent | undefined,
        assignmentDetail: obj.assignment_detail as AssignmentDetail | undefined,
        timestamp: obj.timestamp || 'Baru saja',
      }));
    } catch (e) {
      console.warn('Error fetching posts from Supabase:', e);
      return [];
    }
  }

  /**
   * Fetch official school/app logo from Supabase database or storage
   */
  async fetchAppLogo(): Promise<string | null> {
    try {
      // 1. Cek tabel konfigurasi 'app_settings'
      const { data: appSet, error: err1 } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'app_logo')
        .maybeSingle();

      if (!err1 && appSet?.value) {
        return appSet.value;
      }

      // 2. Cek tabel konfigurasi 'settings'
      const { data: set, error: err2 } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'app_logo')
        .maybeSingle();

      if (!err2 && set?.value) {
        return set.value;
      }

      // 3. Cek file logo di Supabase Storage 'media_belajar/logo'
      const { data: files } = await supabase.storage.from(BUCKET_NAME).list('logo');
      if (files && files.length > 0) {
        const logoFile = files.find((f) => f.name.includes('logo') || f.name.includes('bilindi')) || files[0];
        if (logoFile) {
          const { data: pubData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(`logo/${logoFile.name}`);
          if (pubData?.publicUrl) {
            return pubData.publicUrl;
          }
        }
      }

      // 4. Cek root Supabase Storage 'media_belajar' untuk berkas logo
      const { data: rootFiles } = await supabase.storage.from(BUCKET_NAME).list();
      if (rootFiles && rootFiles.length > 0) {
        const rootLogo = rootFiles.find((f) => f.name.toLowerCase().includes('logo') || f.name.toLowerCase().includes('bilindi'));
        if (rootLogo) {
          const { data: pubData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(rootLogo.name);
          if (pubData?.publicUrl) {
            return pubData.publicUrl;
          }
        }
      }

      return null;
    } catch (e) {
      console.warn('Gagal mengambil logo dari database Supabase:', e);
      return null;
    }
  }

  /**
   * Save official logo to Supabase database (app_settings & settings)
   */
  async saveAppLogo(logoUrl: string): Promise<boolean> {
    try {
      let saved = false;

      // Coba simpan ke app_settings
      try {
        const { error: err1 } = await supabase
          .from('app_settings')
          .upsert({ key: 'app_logo', value: logoUrl, updated_at: new Date().toISOString() });
        if (!err1) saved = true;
      } catch {}

      // Coba simpan ke settings
      try {
        const { error: err2 } = await supabase
          .from('settings')
          .upsert({ key: 'app_logo', value: logoUrl });
        if (!err2) saved = true;
      } catch {}

      return saved;
    } catch (e) {
      console.warn('Gagal menyimpan logo ke database Supabase:', e);
      return false;
    }
  }
}

