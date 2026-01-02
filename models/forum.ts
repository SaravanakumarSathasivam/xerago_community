import { IDocument, IUser } from "./user";
import { IAttachment } from "./article";

export interface IReply extends IDocument {
  id: string;
  author: string | IUser;
  content: string;
  isEdited: boolean;
  editedAt?: Date;
  likes: number;
  isSolution: boolean;
}

export interface IForum extends IDocument {
  id: string;
  title: string;
  content: string;
  author: string | IUser;
  category:
    | "general"
    | "tech"
    | "marketing"
    | "analytics"
    | "ai"
    | "announcements"
    | "support"
    | "feedback";
  tags?: string[];
  status: "active" | "closed" | "archived" | "pinned";
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: Date;
  priority: "low" | "medium" | "high" | "urgent";
  views: number;
  likes: number;
  replies: IReply[];
  isLiked: boolean;
  isEdited: boolean;
  editedAt?: Date;
  lastActivity: Date;
  attachments?: IAttachment[];
}
