import { IDocument } from './user';

export interface IAchievement extends IDocument {
  name: string;
  description: string;
  category: 'participation' | 'knowledge' | 'leadership' | 'collaboration' | 'innovation' | 'mentorship' | 'expertise' | 'community' | 'milestone' | 'special';
  type: 'badge' | 'trophy' | 'medal' | 'certificate' | 'title';
  icon: string;
  color?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  criteria: {
    type: 'article_count' | 'forum_posts' | 'forum_replies' | 'event_attendance' | 'event_creation' | 'likes_received' | 'days_active' | 'consecutive_days' | 'points_earned' | 'level_reached' | 'custom';
    value: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
  };
  isActive: boolean;
  isHidden: boolean;
  prerequisites: string[];
  rewards?: {
    points?: number;
    title?: string;
    specialPrivileges?: string[];
  };
  metadata?: {
    createdBy?: string;
    tags?: string[];
    version?: string;
  };
}
