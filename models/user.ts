export interface IDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser extends IDocument {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin' | 'super_admin';
  department?: string;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  emailVerificationCode?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginCount: number;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      forum: boolean;
      events: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
  };
  gamification: {
    points: number;
    level: number;
    badges: string[];
    achievements: {
      achievement: string;
      earnedAt: Date;
    }[];
    totalMonthlyContributions: number; // Total contributions made in the current month
    streak: number; // Current streak of consecutive days of activity
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}