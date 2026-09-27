export type UserRole = 'STUDENT' | 'TEACHER' | 'PRINCIPAL';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  username: string;
  password?: string;
  className?: string;
  subject?: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  location?: string;
  school: string;
  badges: string[];
  isApproved: boolean;
}

export type PostType = 'LEARNING' | 'ASSIGNMENT' | 'STATUS';

export type PostStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'NEEDS_REVISION';

export interface SectionData {
  text: string;
  fileUrl?: string;
  fileType?: string; // "image" | "video" | "pdf"
  fileName?: string;
  embedUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  pdfName?: string;
  pdfPageCount?: number;
}

export interface StructuredLearningContent {
  headerSection: SectionData;
  pemantik: SectionData;
  tujuan: SectionData;
  inti: SectionData;
  asesmen: SectionData;
}

export interface AssignmentDetail {
  deadline: string;
  targetClass: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentUrl?: string;
}

export interface Post {
  id: string;
  authorId: string;
  type: PostType;
  status: PostStatus;
  timestamp: string;
  title?: string;
  content?: string;
  hashtag?: string;
  imageUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  pdfName?: string;
  pdfPageCount?: number;
  targetClass?: string;
  likes: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  structuredContent?: StructuredLearningContent;
  assignmentDetail?: AssignmentDetail;
  moderationNotes?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  timestamp: string;
}

export interface Story {
  id: string;
  authorId: string;
  imageUrl: string;
  caption?: string;
  timestamp: string;
  targetClass?: string;
  isVideo?: boolean;
  videoUrl?: string;
}

export interface Submission {
  id: string;
  postId: string;
  assignmentHashtag: string;
  studentId: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  grade?: number | null;
  feedback?: string | null;
  isGraded: boolean;
}

export interface ReelItem {
  id: string;
  authorId: string;
  title: string;
  subject: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isVideo?: boolean;
  videoUrl?: string;
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  isImportant: boolean;
}

export interface ClassItem {
  id: string;
  name: string;
  homeroomTeacher: string;
  studentCount: number;
  subjectList: string[];
  schedule: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  imageUrl?: string;
}

export type NotificationType =
  | 'SYSTEM'
  | 'MODERATION_REQUEST'
  | 'POST_APPROVED'
  | 'POST_REVISION'
  | 'POST_REJECTED';

export interface AppNotification {
  id: string;
  recipientId: string; // User ID or "TEACHERS"
  title: string;
  message: string;
  timestamp: string;
  type: NotificationType;
  relatedPostId?: string;
  isRead: boolean;
  actionTaken?: 'APPROVED' | 'REJECTED' | 'REVISION';
}

export type NavTab = 'home' | 'reels' | 'assignments' | 'classes' | 'profile' | 'messenger' | 'settings';
