import { IDocument, IUser } from './user';
import { IAttachment } from './article';

export interface IReply extends IDocument {
  author: string | IUser;
  content: string;
  isEdited: boolean;
  editedAt?: Date;
  likes: string[];
  isSolution: boolean;
}

export interface IForum extends IDocument {
  title: string;
  content: string;
  author: string | IUser;
  category: 'general' | 'tech' | 'marketing' | 'analytics' | 'ai' | 'announcements' | 'support' | 'feedback';
  tags?: string[];
  status: 'active' | 'closed' | 'archived' | 'pinned';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  views: number;
  likes: string[];
  replies: IReply[];
  isEdited: boolean;
  editedAt?: Date;
  lastActivity: Date;
  attachments?: IAttachment[];
}
