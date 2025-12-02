// api.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { IUser } from '../models/user';
import { IEvent, IAttendee } from '../models/event';
import { IForum, IReply } from '../models/forum';
import { IArticle, IComment, IAttachment } from '../models/article';
import { IAchievement } from '../models/achievement';
import { IDropdownOption } from '../models/dropdown-option';
import { IReport } from '../models/report';
import { IPointSettings } from '../models/point-settings';
import { ILeaderboardUser, IMetrics, IEarnedAchievement } from '../models/leaderboard';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Get auth token from localStorage (browser only)
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("xerago-token");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Request wrapper
async function request<T>(
  path: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const token = getAuthToken();
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const data = (options as AxiosRequestConfig).data;
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    if (!isFormData) {
      options.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    }

    const response = await apiClient.request<T>({
      url: path,
      ...options,
    });

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 440 || /Session expired due to inactivity/i.test((axiosError.response?.data as any)?.message || '')) {
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem('xerago-token'); } catch {}
        window.location.href = '/app/(auth)/reset-password';
      }
    }
    if (axiosError.response) {
      throw new Error(
        (axiosError.response.data as any)?.message ||
          `Request failed: ${axiosError.response.status}`
      );
    } else if (axiosError.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(axiosError.message || "Unexpected error");
    }
  }
}

// ===================== API METHODS ===================== //

export interface AuthResponse {
  success: boolean;
  data: { user: IUser; token: string; refreshToken: string };
}

export interface TokenRefreshResponse {
  success: boolean;
  data: { token: string; refreshToken: string };
}

export interface UserProfileResponse {
  success: boolean;
  data: { user: IUser };
}

// Auth
export async function register(payload: {
  name: string;
  email: string;
  password: string;
  department?: string;
  bio?: string;
}): Promise<AuthResponse> {
  return request("/api/auth/register", { method: "POST", data: payload });
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request("/api/auth/login", { method: "POST", data: payload });
}

export async function refreshToken(payload: { refreshToken: string }): Promise<TokenRefreshResponse> {
  return request("/api/auth/refresh", { method: "POST", data: payload });
}

export async function logout(): Promise<{ success: boolean; message: string }> {
  return request("/api/auth/logout", { method: "POST" });
}

export async function forgotPassword(payload: { email: string }): Promise<{
  success: boolean;
  message: string;
}> {
  return request("/api/auth/forgot-password", { method: "POST", data: payload });
}

export async function resetPassword(payload: { token: string; password: string; confirmPassword: string }): Promise<{
  success: boolean;
  message: string;
}> {
  return request("/api/auth/reset-password", { method: "POST", data: payload });
}

export async function verifyEmail(payload: { token: string }): Promise<{
  success: boolean;
  message: string;
}> {
  return request("/api/auth/verify-email", { method: "POST", data: payload });
}

export async function resendVerification(payload: { email: string }): Promise<{
  success: boolean;
  message: string;
}> {
  return request("/api/auth/resend-verification", { method: "POST", data: payload });
}

export async function getMe(): Promise<UserProfileResponse> {
  return request("/api/auth/me", { method: "GET" });
}

// Profile
export async function getUserProfile(): Promise<UserProfileResponse> {
  return request('/api/users/profile', { method: 'GET' });
}

export async function updateUserProfile(payload: Partial<IUser>): Promise<{ success: boolean; message: string }> {
  return request('/api/users/profile', { method: 'PUT', data: payload });
}

export async function uploadAvatar(formData: FormData): Promise<{ success: boolean; message: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await apiClient.post('/api/users/avatar', formData, { headers });
  return response.data;
}

export async function verifyOtp(payload: { email: string; code: string }): Promise<{
  success: boolean;
  message: string;
}> {
  return request("/api/auth/verify-otp", { method: "POST", data: payload });
}

export async function resendOtp(payload: { email: string }): Promise<{
  success: boolean;
  message: string;
}> {
  return request("/api/auth/resend-otp", { method: "POST", data: payload });
}

//Top Contributors
export async function getTopContributors(): Promise<{
  success: boolean;
  data: { topContributors: IUser[] };
}> {
  return request("/api/leaderboard/top-contributors", { method: "GET" });
}

// Events
export interface EventsResponse {
  success: boolean;
  data: { events: IEvent[] };
}

export interface EventResponse {
  success: boolean;
  data: { event: IEvent };
}

export interface EventAttendeesResponse {
  success: boolean;
  data: { attendees: IAttendee[] };
}

export async function getEvents(params?: { sort?: string; order?: 'asc' | 'desc'; category?: string; search?: string; status?: string }): Promise<EventsResponse> {
  const query = new URLSearchParams();
  if (params?.sort) query.set('sort', params.sort);
  if (params?.order) query.set('order', params.order);
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return request(`/api/events${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function createEvent(payload: Partial<IEvent>): Promise<EventResponse> {
  return request("/api/events", { method: "POST", data: payload });
}

export async function createEventForm(formData: FormData): Promise<EventResponse> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await apiClient.post("/api/events", formData, { headers });
  return response.data;
}

export async function toggleRsvp(eventId: string): Promise<EventResponse> {
  return request(`/api/events/${eventId}/rsvp`, { method: "POST" });
}

export async function updateEvent(eventId: string, payload: Partial<IEvent>): Promise<EventResponse> {
  return request(`/api/events/${eventId}`, { method: "PUT", data: payload });
}

export async function getEventAttendees(eventId: string): Promise<EventAttendeesResponse> {
  return request(`/api/events/${eventId}/attendees`, { method: "GET" });
}

// Forums
export interface ForumPostsResponse {
  success: boolean;
  data: { posts: IForum[] };
}

export interface ForumPostResponse {
  success: boolean;
  data: { post: IForum };
}

export async function getForumPosts(params?: { category?: string; search?: string; sort?: string; order?: 'asc' | 'desc', approvalStatus?: string }): Promise<ForumPostsResponse> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.order) query.set('order', params.order);
  if (params?.approvalStatus) query.set('approvalStatus', params.approvalStatus);
  const qs = query.toString();
  return request(`/api/forums/posts${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function getForumPost(postId: string): Promise<ForumPostResponse> {
  return request(`/api/forums/posts/${postId}`, { method: "GET" });
}

export async function createForumPost(formData: FormData): Promise<ForumPostResponse> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let the browser set it with boundary
    const response = await apiClient.post("/api/forums/posts", formData, { headers });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 440) {
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem('xerago-token'); } catch {}
        window.location.href = '/app/(auth)/reset-password';
      }
    }
    if (axiosError.response) {
      throw new Error(
        (axiosError.response.data as any)?.message ||
          `Request failed: ${axiosError.response.status}`
      );
    } else if (axiosError.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(axiosError.message || "Unexpected error");
    }
  }
}

export async function updateForumPost(postId: string, formData: FormData): Promise<ForumPostResponse> {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let the browser set it with boundary
    const response = await apiClient.put(`/api/forums/posts/${postId}`, formData, { headers });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 440) {
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem('xerago-token'); } catch {}
        window.location.href = '/app/(auth)/reset-password';
      }
    }
    if (axiosError.response) {
      throw new Error(
        (axiosError.response.data as any)?.message ||
          `Request failed: ${axiosError.response.status}`
      );
    } else if (axiosError.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(axiosError.message || "Unexpected error");
    }
  }
}

export async function deleteForumPost(postId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return request(`/api/forums/posts/${postId}`, { method: "DELETE" });
}

export async function likeForumPost(postId: string): Promise<ForumPostResponse> {
  return request(`/api/forums/posts/${postId}/like`, { method: "POST" });
}

export async function replyForumPost(
  postId: string,
  payload: { content: string }
): Promise<ForumPostResponse> {
  return request(`/api/forums/posts/${postId}/replies`, {
    method: "POST",
    data: payload,
  });
}

export async function likeForumReply(postId: string, replyId: string): Promise<ForumPostResponse> {
  return request(`/api/forums/posts/${postId}/replies/${replyId}/like`, { method: "POST" });
}

// Admin forum moderation
export async function updateForumPostApproval(postId: string, approvalStatus: 'pending' | 'approved' | 'rejected'): Promise<{
  success: boolean;
  message: string;
  data: { post: IForum };
}> {
  return request(`/api/admin/forums/posts/${postId}/approval`, {
    method: "PUT",
    data: { approvalStatus },
  });
}

// Articles
export interface ArticlesResponse {
  success: boolean;
  data: { pending: IArticle[]; articles: IArticle[] };
}

export interface ArticleResponse {
  success: boolean;
  data: { article: IArticle };
}

export async function getArticles(params?: { sort?: string; order?: 'asc' | 'desc'; category?: string; search?: string }): Promise<ArticlesResponse> {
  const query = new URLSearchParams();
  if (params?.sort) query.set('sort', params.sort);
  if (params?.order) query.set('order', params.order);
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return request(`/api/articles${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function createArticle(payload: Partial<IArticle>): Promise<ArticleResponse> {
  return request("/api/articles", { method: "POST", data: payload });
}

export async function createArticleForm(formData: FormData): Promise<ArticleResponse> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await apiClient.post("/api/articles", formData, { headers });
  return response.data;
}

export async function updateArticle(id: string, payload: Partial<IArticle>): Promise<ArticleResponse> {
  return request(`/api/articles/${id}`, { method: "PUT", data: payload });
}

export async function deleteArticle(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/api/articles/${id}`, { method: "DELETE" });
}

export async function likeArticle(articleId: string): Promise<ArticleResponse> {
  return request(`/api/articles/${articleId}/like`, { method: "POST" });
}

export async function bookmarkArticle(articleId: string): Promise<ArticleResponse> {
  return request(`/api/articles/${articleId}/bookmark`, { method: "POST" });
}

export async function getArticle(id: string): Promise<ArticleResponse> {
  return request(`/api/articles/${id}`, { method: "GET" });
}

// Feed
export interface FeedItem {
  _id: string;
  type: 'article' | 'forum' | 'event' | 'achievement'; // Assuming feed items can be articles or forum posts
  // Add other common properties if they exist across feed item types
  // Or use a discriminated union if the types are very different
}

export interface FeedResponse {
  success: boolean;
  data: { items: FeedItem[]; page: number; limit: number; total: number; totalPages: number };
}

export async function getFeed(page = 1, limit = 5): Promise<FeedResponse> {
  return request(`/api/feed?page=${page}&limit=${limit}`, { method: "GET" });
}

// Dropdown Options
export interface DropdownOptionsResponse {
  success: boolean;
  data: IDropdownOption[];
  count: number;
}

export interface DropdownCategoriesResponse {
  success: boolean;
  data: string[];
  count: number;
}

export interface BatchDropdownOptionsResponse {
  success: boolean;
  data: Record<string, IDropdownOption[]>;
}

export interface DropdownOptionResponse {
  success: boolean;
  message: string;
  data: IDropdownOption;
}

export async function getDropdownOptions(category: string): Promise<DropdownOptionsResponse> {
  return request(`/api/dropdowns/${category}`, { method: "GET" });
}

export async function getDropdownCategories(): Promise<DropdownCategoriesResponse> {
  return request("/api/dropdowns/categories", { method: "GET" });
}

export async function getBatchDropdownOptions(categories: string[]): Promise<BatchDropdownOptionsResponse> {
  return request("/api/dropdowns/batch", {
    method: "POST",
    data: { categories },
  });
}

// Admin Dropdown Management
export async function createDropdownOption(payload: {
  category: string;
  value: string;
  label: string;
  description?: string;
  order?: number;
  metadata?: {
    color?: string;
    icon?: string;
    parentCategory?: string;
  };
}): Promise<DropdownOptionResponse> {
  return request("/api/dropdowns", { method: "POST", data: payload });
}

export async function updateDropdownOption(
  id: string,
  payload: Partial<IDropdownOption>
): Promise<DropdownOptionResponse> {
  return request(`/api/dropdowns/${id}`, { method: "PUT", data: payload });
}

export async function deleteDropdownOption(id: string): Promise<{
  success: boolean;
  message: string;
}> {
  return request(`/api/dropdowns/${id}`, { method: "DELETE" });
}

export async function seedDropdownOptions(): Promise<{
  success: boolean;
  message: string;
}> {
  return request("/api/dropdowns/seed", { method: "POST" });
}

// Admin Dropdown CRUD
export async function adminCreateDropdownOption(payload: { category: string; value: string; label: string; description?: string; order?: number; metadata?: IDropdownOption['metadata'] }): Promise<DropdownOptionResponse> {
  return request("/api/dropdowns", { method: "POST", data: payload });
}

export async function adminUpdateDropdownOption(id: string, payload: Partial<IDropdownOption>): Promise<DropdownOptionResponse> {
  return request(`/api/dropdowns/${id}`, { method: "PUT", data: payload });
}

export async function adminDeleteDropdownOption(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/api/dropdowns/${id}`, { method: "DELETE" });
}

// Gamification point settings
export interface PointSettingsResponse {
  success: boolean;
  data: { points: IPointSettings['value'] };
}

export async function getPointSettings(): Promise<PointSettingsResponse> {
  return request(`/api/admin/settings/points`, { method: "GET" });
}

export async function updatePointSettings(points: IPointSettings['value']): Promise<PointSettingsResponse & { message: string }> {
  return request(`/api/admin/settings/points`, { method: "PUT", data: { points } });
}

// Leaderboard
export interface LeaderboardResponse {
  success: boolean;
  data: { leaderboard: ILeaderboardUser[] };
}

export interface LeaderboardSummaryResponse {
  success: boolean;
  data: { period: string; metrics: IMetrics; leaderboard: ILeaderboardUser[] }; // TODO: Define metrics interface
}

export interface AchievementsResponse {
  success: boolean;
  data: { achievements: IAchievement[] };
}

export interface CommunityStatsResponse {
  success: boolean;
  data: { activeMembers: number; totalPosts: number; totalArticles: number; helpfulAnswers: number };
}

export interface MyLeaderboardSummaryResponse {
  success: boolean;
  data: { points: number; level: number; progressPercent: number; pointsToNext: number; earnedAchievements: IEarnedAchievement[] };
}

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  return request(`/api/leaderboard`, { method: "GET" });
}

export async function getLeaderboardSummary(period: 'weekly'|'monthly'|'all' = 'all'): Promise<LeaderboardSummaryResponse> {
  return request(`/api/leaderboard/summary?period=${period}`, { method: "GET" });
}

export async function getAchievements(): Promise<AchievementsResponse> {
  return request(`/api/leaderboard/achievements`, { method: "GET" });
}

export async function getCommunityStats(): Promise<CommunityStatsResponse> {
  return request(`/api/leaderboard/community-stats`, { method: "GET" });
}

export async function getMyLeaderboardSummary(): Promise<MyLeaderboardSummaryResponse> {
  return request(`/api/leaderboard/my-summary`, { method: "GET" });
}

export interface AdminStatsResponse {
  success: boolean;
  data: { 
    stats: {
      totalUsers: number;
      activeUsers: number;
      totalEvents: number;
      publishedArticles: number;
      totalForumPosts: number;
      pendingReports: number;
      newUsersThisWeek: number;
      engagementRate: number;
      averageSessionTime: string;
    } 
  };
}

export interface AdminUsersResponse {
  success: boolean;
  data: { users: IUser[]; total: number };
}

export interface AdminReportsResponse {
  success: boolean;
  data: { reports: IReport[]; total: number };
}

export interface DailyActiveUser {
  date: string;
  count: number;
}

export interface TopCategory {
  name: string;
  count: number;
  engagement: number;
}

export interface AdminAnalyticsResponse {
  success: boolean;
  data: {
    engagementRate: number;
    averageSessionTime: string; // e.g., "00:05:30"
    dailyActiveUsers: DailyActiveUser[];
    contentGrowth: number;
    topCategories: TopCategory[];
  };
}

export interface AdminForumPostsResponse {
  success: boolean;
  data: { posts: IForum[]; total: number };
}

export interface AdminArticlesResponse {
  success: boolean;
  data: { articles: IArticle[]; total: number };
}

export interface AdminAchievementsResponse {
  success: boolean;
  data: { achievements: IAchievement[] };
}

export async function getAdminStats(): Promise<AdminStatsResponse> {
  return request(`/api/admin/stats`, { method: "GET" });
}

export async function getAdminUsers(params: { page?: number; limit?: number; role?: string; department?: string; isActive?: boolean|string; search?: string } = {}): Promise<AdminUsersResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) query.set(k, String(v)); });
  const qs = query.toString();
  return request(`/api/admin/users${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function updateAdminUserRole(userId: string, role: string): Promise<{ success: boolean; message: string; data: { user: IUser } }> {
  return request(`/api/admin/users/${userId}/role`, { method: "PUT", data: { role } });
}

export async function updateAdminUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; message: string; data: { user: IUser } }> {
  return request(`/api/admin/users/${userId}/status`, { method: "PUT", data: { isActive } });
}

export async function getAdminReports(params: { status?: string; page?: number; limit?: number } = {}): Promise<AdminReportsResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) query.set(k, String(v)); });
  const qs = query.toString();
  return request(`/api/admin/reports${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function getAdminAnalytics(): Promise<AdminAnalyticsResponse> {
  return request(`/api/admin/analytics`, { method: "GET" });
}

// Admin Content
export async function adminListForumPosts(params: { page?: number; limit?: number; search?: string; approvalStatus?: string } = {}): Promise<AdminForumPostsResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) query.set(k, String(v)); });
  const qs = query.toString();
  return request(`/api/admin/forums/posts${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function adminDeleteForumPost(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/api/admin/forums/posts/${id}`, { method: "DELETE" });
}

export async function adminListArticles(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<AdminArticlesResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) query.set(k, String(v)); });
  const qs = query.toString();
  return request(`/api/admin/articles${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function adminUpdateArticleStatus(id: string, status: string): Promise<{ success: boolean; message: string; data: { article: IArticle } }> {
  return request(`/api/admin/articles/${id}/status`, { method: "PUT", data: { status } });
}

export async function adminUpdateReportStatus(
  id: string,
  status: 'pending' | 'resolved' | 'dismissed'
): Promise<{ success: boolean; message: string; data: { report: IReport } }> {
  return request(`/api/admin/reports/${id}/status`, { method: "PUT", data: { status } });
}

export async function adminListAchievements(): Promise<AdminAchievementsResponse> {
  return request(`/api/admin/achievements`, { method: "GET" });
}

export async function adminCreateAchievement(payload: Partial<IAchievement>): Promise<{ success: boolean; data: { achievement: IAchievement } }> {
  return request(`/api/admin/achievements`, { method: "POST", data: payload });
}

export async function adminUpdateAchievement(id: string, payload: Partial<IAchievement>): Promise<{ success: boolean; data: { achievement: IAchievement } }> {
  return request(`/api/admin/achievements/${id}`, { method: "PUT", data: payload });
}

export async function adminDeleteAchievement(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/api/admin/achievements/${id}`, { method: "DELETE" });
}