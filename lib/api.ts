// api.ts
import axios, { AxiosRequestConfig } from "axios";

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

    // Ensure proper Content-Type: JSON for objects, let browser set for FormData
    const data = (options as any).data;
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
  } catch (error: any) {
    if (error.response?.status === 440 || /Session expired due to inactivity/i.test(error.response?.data?.message)) {
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem('xerago-token'); } catch {}
        window.location.href = '/app/(auth)/reset-password';
      }
    }
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
          `Request failed: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(error.message || "Unexpected error");
    }
  }
}

// ===================== API METHODS ===================== //

// Auth
export async function register(payload: {
  name: string;
  email: string;
  password: string;
  department?: string;
  bio?: string;
}): Promise<{
  success: boolean;
  data: { user: any; token: string; refreshToken: string };
}> {
  return request("/api/auth/register", { method: "POST", data: payload });
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<{
  success: boolean;
  data: { user: any; token: string; refreshToken: string };
}> {
  return request("/api/auth/login", { method: "POST", data: payload });
}

export async function refreshToken(payload: { refreshToken: string }): Promise<{
  success: boolean;
  data: { token: string; refreshToken: string };
}> {
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

export async function getMe(): Promise<{
  success: boolean;
  data: { user: any };
}> {
  return request("/api/auth/me", { method: "GET" });
}

// Profile
export async function getUserProfile(): Promise<{ success: boolean; data: { user: any } }> {
  return request('/api/users/profile', { method: 'GET' });
}

export async function updateUserProfile(payload: any): Promise<{ success: boolean; message: string }> {
  return request('/api/users/profile', { method: 'PUT', data: payload });
}

export async function uploadAvatar(formData: FormData): Promise<{ success: boolean; message: string }> {
  const token = getAuthToken();
  const headers: any = {};
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

// Events
export async function getEvents(params?: { sort?: string; order?: 'asc' | 'desc'; category?: string; search?: string; status?: string }): Promise<{
  success: boolean;
  data: { events: any[] };
}> {
  const query = new URLSearchParams();
  if (params?.sort) query.set('sort', params.sort);
  if (params?.order) query.set('order', params.order);
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return request(`/api/events${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function createEvent(payload: any): Promise<{
  success: boolean;
  data: { event: any };
}> {
  return request("/api/events", { method: "POST", data: payload });
}

export async function createEventForm(formData: FormData): Promise<{ success: boolean; data: { event: any } }> {
  const token = getAuthToken();
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await apiClient.post("/api/events", formData, { headers });
  return response.data;
}

export async function toggleRsvp(eventId: string): Promise<{
  success: boolean;
  data: { event: any };
}> {
  return request(`/api/events/${eventId}/rsvp`, { method: "POST" });
}

export async function updateEvent(eventId: string, payload: any): Promise<{ success: boolean; data: { event: any } }> {
  return request(`/api/events/${eventId}`, { method: "PUT", data: payload });
}

export async function getEventAttendees(eventId: string): Promise<{ success: boolean; data: { attendees: any[] } }> {
  return request(`/api/events/${eventId}/attendees`, { method: "GET" });
}

// Forums
export async function getForumPosts(params?: { category?: string; search?: string; sort?: string; order?: 'asc' | 'desc' }): Promise<{
  success: boolean;
  data: { posts: any[] };
}> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.order) query.set('order', params.order);
  const qs = query.toString();
  return request(`/api/forums/posts${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function getForumPost(postId: string): Promise<{
  success: boolean;
  data: { post: any };
}> {
  return request(`/api/forums/posts/${postId}`, { method: "GET" });
}

export async function createForumPost(formData: FormData): Promise<{
  success: boolean;
  data: { post: any };
}> {
  try {
    const token = getAuthToken();
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let the browser set it with boundary
    const response = await apiClient.post("/api/forums/posts", formData, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 440) {
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem('xerago-token'); } catch {}
        window.location.href = '/app/(auth)/reset-password';
      }
    }
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
          `Request failed: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(error.message || "Unexpected error");
    }
  }
}

export async function updateForumPost(postId: string, formData: FormData): Promise<{
  success: boolean;
  data: { post: any };
}> {
  try {
    const token = getAuthToken();
    const headers: any = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let the browser set it with boundary
    const response = await apiClient.put(`/api/forums/posts/${postId}`, formData, { headers });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 440) {
      if (typeof window !== 'undefined') {
        try { localStorage.removeItem('xerago-token'); } catch {}
        window.location.href = '/app/(auth)/reset-password';
      }
    }
    if (error.response) {
      throw new Error(
        error.response.data?.message ||
          `Request failed: ${error.response.status}`
      );
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(error.message || "Unexpected error");
    }
  }
}

export async function deleteForumPost(postId: string): Promise<{
  success: boolean;
  message: string;
}> {
  return request(`/api/forums/posts/${postId}`, { method: "DELETE" });
}

export async function likeForumPost(postId: string): Promise<{
  success: boolean;
  data: { post: any };
}> {
  return request(`/api/forums/posts/${postId}/like`, { method: "POST" });
}

export async function replyForumPost(
  postId: string,
  payload: { content: string }
): Promise<{ success: boolean; data: { post: any } }> {
  return request(`/api/forums/posts/${postId}/replies`, {
    method: "POST",
    data: payload,
  });
}

export async function likeForumReply(postId: string, replyId: string): Promise<{
  success: boolean;
  data: { post: any };
}> {
  return request(`/api/forums/posts/${postId}/replies/${replyId}/like`, { method: "POST" });
}

// Admin forum moderation
export async function updateForumPostApproval(postId: string, approvalStatus: 'pending' | 'approved' | 'rejected'): Promise<{
  success: boolean;
  message: string;
  data: { post: any };
}> {
  return request(`/api/admin/forums/posts/${postId}/approval`, {
    method: "PUT",
    data: { approvalStatus },
  });
}

// Articles
export async function getArticles(params?: { sort?: string; order?: 'asc' | 'desc'; category?: string; search?: string }): Promise<{
  success: boolean;
  data: {
    pending: any[]; articles: any[] 
};
}> {
  const query = new URLSearchParams();
  if (params?.sort) query.set('sort', params.sort);
  if (params?.order) query.set('order', params.order);
  if (params?.category && params.category !== 'all') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return request(`/api/articles${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function createArticle(payload: any): Promise<{
  success: boolean;
  data: { article: any };
}> {
  return request("/api/articles", { method: "POST", data: payload });
}

export async function createArticleForm(formData: FormData): Promise<{ success: boolean; data: { article: any } }> {
  const token = getAuthToken();
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await apiClient.post("/api/articles", formData, { headers });
  return response.data;
}

export async function updateArticle(id: string, payload: any): Promise<{ success: boolean; data: { article: any } }> {
  return request(`/api/articles/${id}`, { method: "PUT", data: payload });
}

export async function deleteArticle(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/api/articles/${id}`, { method: "DELETE" });
}

export async function likeArticle(articleId: string): Promise<{
  success: boolean;
  data: { article: any };
}> {
  return request(`/api/articles/${articleId}/like`, { method: "POST" });
}

export async function bookmarkArticle(articleId: string): Promise<{
  success: boolean;
  data: { article: any };
}> {
  return request(`/api/articles/${articleId}/bookmark`, { method: "POST" });
}

export async function getArticle(id: string): Promise<{ success: boolean; data: { article: any } }> {
  return request(`/api/articles/${id}`, { method: "GET" });
}

// Feed
export async function getFeed(page = 1, limit = 5): Promise<{
  success: boolean;
  data: { items: any[]; page: number; limit: number; total: number; totalPages: number };
}> {
  return request(`/api/feed?page=${page}&limit=${limit}`, { method: "GET" });
}

// Dropdown Options
export async function getDropdownOptions(category: string): Promise<{
  success: boolean;
  data: any[];
  count: number;
}> {
  return request(`/api/dropdowns/${category}`, { method: "GET" });
}

export async function getDropdownCategories(): Promise<{
  success: boolean;
  data: string[];
  count: number;
}> {
  return request("/api/dropdowns/categories", { method: "GET" });
}

export async function getBatchDropdownOptions(categories: string[]): Promise<{
  success: boolean;
  data: Record<string, any[]>;
}> {
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
  metadata?: any;
}): Promise<{
  success: boolean;
  message: string;
  data: any;
}> {
  return request("/api/dropdowns", { method: "POST", data: payload });
}

export async function updateDropdownOption(
  id: string,
  payload: any
): Promise<{
  success: boolean;
  message: string;
  data: any;
}> {
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
export async function adminCreateDropdownOption(payload: { category: string; value: string; label: string; description?: string; order?: number; metadata?: any }): Promise<{ success: boolean; message: string; data: any }> {
  return request("/api/dropdowns", { method: "POST", data: payload });
}

export async function adminUpdateDropdownOption(id: string, payload: any): Promise<{ success: boolean; message: string; data: any }> {
  return request(`/api/dropdowns/${id}`, { method: "PUT", data: payload });
}

export async function adminDeleteDropdownOption(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/api/dropdowns/${id}`, { method: "DELETE" });
}

// Gamification point settings
export async function getPointSettings(): Promise<{ success: boolean; data: { points: any } }> {
  return request(`/api/admin/settings/points`, { method: "GET" });
}

export async function updatePointSettings(points: any): Promise<{ success: boolean; message: string; data: { points: any } }> {
  return request(`/api/admin/settings/points`, { method: "PUT", data: { points } });
}

// Leaderboard
export async function getLeaderboard(): Promise<{
  success: boolean;
  data: { leaderboard: any[] };
}> {
  return request(`/api/leaderboard`, { method: "GET" });
}

export async function getLeaderboardSummary(period: 'weekly'|'monthly'|'all' = 'all'): Promise<{
  success: boolean;
  data: { period: string; metrics: any; leaderboard: any[] };
}> {
  return request(`/api/leaderboard/summary?period=${period}`, { method: "GET" });
}

export async function getAchievements(): Promise<{
  success: boolean;
  data: { achievements: any[] };
}> {
  return request(`/api/leaderboard/achievements`, { method: "GET" });
}

export async function getCommunityStats(): Promise<{
  success: boolean;
  data: { activeMembers: number; totalPosts: number; totalArticles: number; helpfulAnswers: number };
}> {
  return request(`/api/leaderboard/community-stats`, { method: "GET" });
}

export async function getMyLeaderboardSummary(): Promise<{
  success: boolean;
  data: { points: number; level: number; progressPercent: number; pointsToNext: number; earnedAchievements: any[] };
}> {
  return request(`/api/leaderboard/my-summary`, { method: "GET" });
}

// Admin
export async function getAdminStats(): Promise<{ success: boolean; data: { stats: any } }> {
  return request(`/api/admin/stats`, { method: "GET" });
}

export async function getAdminUsers(params: { page?: number; limit?: number; role?: string; department?: string; isActive?: boolean|string; search?: string } = {}): Promise<{ success: boolean; data: { users: any[]; total: number } }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) query.set(k, String(v)); });
  const qs = query.toString();
  return request(`/api/admin/users${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function updateAdminUserRole(userId: string, role: string): Promise<{ success: boolean; message: string; data: { user: any } }> {
  return request(`/api/admin/users/${userId}/role`, { method: "PUT", data: { role } });
}

export async function updateAdminUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; message: string; data: { user: any } }> {
  return request(`/api/admin/users/${userId}/status`, { method: "PUT", data: { isActive } });
}

export async function getAdminReports(params: { status?: string; page?: number; limit?: number } = {}): Promise<{ success: boolean; data: { reports: any[]; total: number } }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) query.set(k, String(v)); });
  const qs = query.toString();
  return request(`/api/admin/reports${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function getAdminAnalytics(): Promise<{ success: boolean; data: { engagementRate: number; averageSessionTime: string; dailyActiveUsers: any[]; contentGrowth: number; topCategories: any[] } }> {
  return request(`/api/admin/analytics`, { method: "GET" });
}

// Admin Content
export async function adminListForumPosts(params: { page?: number; limit?: number; search?: string; approvalStatus?: string } = {}): Promise<{ success: boolean; data: { posts: any[]; total: number } }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) query.set(k, String(v)); });
  const qs = query.toString();
  return request(`/api/admin/forums/posts${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function adminDeleteForumPost(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/api/admin/forums/posts/${id}`, { method: "DELETE" });
}

export async function adminListArticles(params: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<{ success: boolean; data: { articles: any[]; total: number } }> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null) query.set(k, String(v)); });
  const qs = query.toString();
  return request(`/api/admin/articles${qs ? `?${qs}` : ''}`, { method: "GET" });
}

export async function adminUpdateArticleStatus(id: string, status: string): Promise<{ success: boolean; message: string; data: { article: any } }> {
  return request(`/api/admin/articles/${id}/status`, { method: "PUT", data: { status } });
}

export async function adminUpdateReportStatus(
  id: string,
  status: 'pending' | 'resolved' | 'dismissed'
): Promise<{ success: boolean; message: string; data: { report: any } }> {
  return request(`/api/admin/reports/${id}/status`, { method: "PUT", data: { status } });
}

export async function adminListAchievements(): Promise<{ success: boolean; data: { achievements: any[] } }> {
  return request(`/api/admin/achievements`, { method: "GET" });
}

export async function adminCreateAchievement(payload: any): Promise<{ success: boolean; data: { achievement: any } }> {
  return request(`/api/admin/achievements`, { method: "POST", data: payload });
}

export async function adminUpdateAchievement(id: string, payload: any): Promise<{ success: boolean; data: { achievement: any } }> {
  return request(`/api/admin/achievements/${id}`, { method: "PUT", data: payload });
}

export async function adminDeleteAchievement(id: string): Promise<{ success: boolean; message: string }> {
  return request(`/api/admin/achievements/${id}`, { method: "DELETE" });
}