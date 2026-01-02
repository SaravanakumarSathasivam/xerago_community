import { IUser } from './user';
import { IAchievement } from './achievement';

export interface IMetrics {
  totalPoints: number;
  totalUsers: number;
  totalAchievements: number;
  // Add any other metrics here
}

export interface ILeaderboardUser extends IUser {
  id: string;
  weeklyPoints?: number;
  monthlyPoints?: number;
  postsCount?: number;
  helpfulAnswers?: number;
  rank?: number;
  contribution?: number;
  totalMonthlyContributions?: number;
}

export interface IEarnedAchievement {
  achievement: IAchievement;
  earnedAt: Date;
}

