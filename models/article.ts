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
  title: string;
  content: string;
  excerpt?: string;
  author: string | IUser;
  category: 'technology' | 'marketing' | 'analytics' | 'ai' | 'business' | 'tutorial' | 'news' | 'case-study' | 'best-practices' | 'tools';
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  views: number;
  likes: string[];
  bookmarks: string[];
  comments: IComment[];
  readingTime: number;
  isEdited: boolean;
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
