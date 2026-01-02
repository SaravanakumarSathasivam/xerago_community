import { IDocument } from './user';

export interface IPointSettings extends IDocument {
  key: string;
  value: {
    ARTICLE_CREATE?: number;
    ARTICLE_LIKE?: number;
    FORUM_POST_CREATE?: number;
    FORUM_REPLY_CREATE?: number;
    EVENT_CREATE?: number;
    EVENT_ATTEND?: number;
    ACHIEVEMENT_EARN?: number;
    // Add other point-related settings as needed
  };
}

