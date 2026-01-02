import { IDocument } from './user';

export interface IReport extends IDocument {
  type: 'inappropriate_content' | 'spam' | 'harassment' | 'other';
  reportedBy: string;
  targetUser?: string;
  targetContent?: {
    model?: 'Forum' | 'Article' | 'Event';
    refId?: string;
  };
  reason?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
}

