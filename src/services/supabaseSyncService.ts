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
   * Upload media (images, docs, audio, videos) to Supabase Storage
   */
  async uploadMedia(file: File | Blob, folder = 'posts'): Promise<string | null> {
    try {
      const fileExt = file.type.split('/')[1] || 'jpg';
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Storage upload error:', error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('Failed to upload media to Supabase:', e);
      return null;
    }
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
}
