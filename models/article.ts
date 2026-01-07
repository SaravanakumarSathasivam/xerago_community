import { IDocument, IUser } from './user';

export interface IAttachment {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface IComment {
  author: string | IUser;
  content: string;
  likes: string[];
  isEdited: boolean;
  editedAt?: Date;
}

export interface IArticle extends IDocument {
  id: string;
  sku?: string;
  title: string;
  content: string;
  excerpt?: string;
  author: IUser;
  category: 'technology' | 'marketing' | 'analytics' | 'ai' | 'business' | 'tutorial' | 'news' | 'case-study' | 'best-practices' | 'tools';
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  views: number;
  likes: number;
  bookmarks: number;
  comments: IComment[];
  readingTime: number;
  isEdited: boolean;
  isLiked: boolean;
  isBookmarked: boolean;
  editedAt?: Date;
  publishedAt?: Date;
  attachments?: IAttachment[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'guide' | 'tutorial' | 'checklist' | 'comparison';
}
