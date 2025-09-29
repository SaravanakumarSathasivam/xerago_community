// api.ts
import axios, { AxiosRequestConfig } from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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

    const response = await apiClient.request<T>({
      url: path,
      ...options,
    });

    return response.data;
  } catch (error: any) {
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
export async function getEvents(): Promise<{
  success: boolean;
  data: { events: any[] };
}> {
  return request("/api/events", { method: "GET" });
}

export async function createEvent(payload: any): Promise<{
  success: boolean;
  data: { event: any };
}> {
  return request("/api/events", { method: "POST", data: payload });
}

export async function toggleRsvp(eventId: string): Promise<{
  success: boolean;
  data: { event: any };
}> {
  return request(`/api/events/${eventId}/rsvp`, { method: "POST" });
}

// Forums
export async function getForumPosts(): Promise<{
  success: boolean;
  data: { posts: any[] };
}> {
  return request("/api/forums/posts", { method: "GET" });
}

export async function createForumPost(payload: any): Promise<{
  success: boolean;
  data: { post: any };
}> {
  return request("/api/forums/posts", { method: "POST", data: payload });
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

// Articles
export async function getArticles(): Promise<{
  success: boolean;
  data: { articles: any[] };
}> {
  return request("/api/articles", { method: "GET" });
}

export async function createArticle(payload: any): Promise<{
  success: boolean;
  data: { article: any };
}> {
  return request("/api/articles", { method: "POST", data: payload });
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

export async function getAdminAnalytics(): Promise<{ success: boolean; data: { topCategories: any[]; dailyActiveUsers: any[] } }> {
  return request(`/api/admin/analytics`, { method: "GET" });
}