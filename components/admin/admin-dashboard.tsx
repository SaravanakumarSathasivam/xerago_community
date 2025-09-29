"use client"

import { useEffect, useState } from "react"
import { getAdminStats, getAdminUsers, updateAdminUserRole, updateAdminUserStatus, getAdminReports, getAdminAnalytics } from "@/lib/api"
import { useDropdownOptions } from "@/hooks/use-dropdown-options"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Users,
  MessageSquare,
  BookOpen,
  AlertTriangle,
  Shield,
  BarChart3,
  UserCheck,
  Flag,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react"

const adminStats = {
  totalUsers: 0,
  activeUsers: 0,
  totalPosts: 0,
  totalArticles: 0,
  pendingReports: 0,
  newUsersThisWeek: 0,
  engagementRate: 0,
  averageSessionTime: "0m",
}

const mockUsers: any[] = []

const mockReports = [
  {
    id: "1",
    type: "inappropriate_content",
    reportedBy: "John Doe",
    targetUser: "Alex Smith",
    targetContent: "Inappropriate comment in Marketing discussion",
    reason: "Offensive language and unprofessional behavior",
    status: "pending",
    createdAt: "2024-01-14T16:30:00Z",
    priority: "medium",
  },
  {
    id: "2",
    type: "spam",
    reportedBy: "Jane Wilson",
    targetUser: "Bob Johnson",
    targetContent: "Repeated promotional posts in multiple forums",
    reason: "Posting promotional content repeatedly",
    status: "pending",
    createdAt: "2024-01-13T11:20:00Z",
    priority: "low",
  },
  {
    id: "3",
    type: "harassment",
    reportedBy: "Lisa Wang",
    targetUser: "Tom Brown",
    targetContent: "Personal attacks in AI discussion thread",
    reason: "Targeted harassment and personal attacks",
    status: "pending",
    createdAt: "2024-01-12T14:45:00Z",
    priority: "high",
  },
]

const mockAnalytics = {
  dailyActiveUsers: [
    { date: "2024-01-08", users: 45 },
    { date: "2024-01-09", users: 52 },
    { date: "2024-01-10", users: 48 },
    { date: "2024-01-11", users: 61 },
    { date: "2024-01-12", users: 58 },
    { date: "2024-01-13", users: 67 },
    { date: "2024-01-14", users: 73 },
    { date: "2024-01-15", users: 89 },
  ],
  topCategories: [
    { name: "AI & Innovation", posts: 156, engagement: 85 },
    { name: "Marketing", posts: 134, engagement: 78 },
    { name: "Technology", posts: 98, engagement: 72 },
    { name: "Analytics", posts: 87, engagement: 81 },
  ],
}

interface AdminDashboardProps {
  currentUser: any
}

interface AnalyticsRes {
  topCategories: any[]
  dailyActiveUsers: any[]
}

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  totalArticles: number
  pendingReports: number
  newUsersThisWeek: number
  engagementRate: number
  averageSessionTime: string
}

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState<any[]>(mockUsers)
  const [reports, setReports] = useState(mockReports)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [analyticsRes, setAnalyticsRes] = useState<AnalyticsRes | undefined>()
  const [adminStats, setAdminStats] = useState<AdminStats | undefined>()

  // Fetch dropdown options from API
  const { options: userStatusOptions, loading: userStatusLoading } = useDropdownOptions('admin_user_status');
  const { options: reportPriorityOptions, loading: reportPriorityLoading } = useDropdownOptions('report_priority');
  const { options: reportTypeOptions, loading: reportTypeLoading } = useDropdownOptions('report_type');

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  useEffect(() => {
    ;(async () => {
      try {
        const statsRes = await getAdminStats()
        console.log(statsRes.data.stats, 'statsRes')
        setAdminStats(statsRes.data.stats.map((s: any) => ({
          totalUsers: s.totalUsers || 0,
          activeUsers: s.activeUsers,
          totalPosts: s.totalPosts,
          totalArticles: s.totalArticles,
          pendingReports: s.pendingReports,
          newUsersThisWeek: s.newUsersThisWeek,
          engagementRate: s.engagementRate,
          averageSessionTime: s.averageSessionTime,
        })))
        // You can render statsRes.data.stats directly where needed

        const usersRes = await getAdminUsers({ page: 1, limit: 20 })
        setUsers(usersRes.data.users.map((u: any) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          department: u.department,
          avatar: u.avatar,
          joinedAt: u.createdAt,
          lastActive: u.updatedAt,
          status: u.isActive ? 'active' : 'suspended',
          points: u.gamification?.points || 0,
          postsCount: 0,
          articlesCount: 0,
          role: u.role || 'member',
        })))

        const reportsRes = await getAdminReports({ status: 'pending', page: 1, limit: 10 })
        setReports(reportsRes.data.reports.map((r: any) => ({
          id: r._id,
          type: r.type,
          reportedBy: r.reportedBy?.name || 'Unknown',
          targetUser: r.targetUser?.name || '-',
          targetContent: r.targetContent?.model || '-',
          reason: r.reason,
          status: r.status,
          createdAt: r.createdAt,
          priority: r.priority,
        })))

        const analyticsRes = await getAdminAnalytics()
        setAnalyticsRes(analyticsRes.data)
        // analyticsRes.data.topCategories and .dailyActiveUsers can replace mockAnalytics
      } catch {}
    })()
  }, [])

  const handleReportAction = (reportId: string, action: "approve" | "reject") => {
    setReports(
      reports.map((report) =>
        report.id === reportId ? { ...report, status: action === "approve" ? "resolved" : "dismissed" } : report,
      ),
    )
    // Optionally call backend to persist status update when an endpoint is added
  }

  const handleUserAction = async (userId: string, action: "suspend" | "activate" | "promote" | "demote") => {
    try {
      if (action === 'suspend' || action === 'activate') {
        await updateAdminUserStatus(userId, action === 'activate')
        setUsers(users.map((u) => u.id === userId ? { ...u, status: action === 'activate' ? 'active' : 'suspended' } : u))
      } else if (action === 'promote' || action === 'demote') {
        const nextRole = action === 'promote' ? (users.find(u => u.id === userId)?.role === 'member' ? 'moderator' : 'admin') : (users.find(u => u.id === userId)?.role === 'admin' ? 'moderator' : 'member')
        await updateAdminUserRole(userId, nextRole!)
        setUsers(users.map((u) => u.id === userId ? { ...u, role: nextRole } : u))
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">Manage community, users, and content</p>
        </div>
        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
          <Shield className="w-3 h-3 mr-1" />
          Administrator
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.totalUsers}</div>
                <p className="text-xs text-muted-foreground">+{adminStats?.newUsersThisWeek} this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((adminStats?.activeUsers || 0 / adminStats?.totalUsers || 0) * 100)}% of total
                </p>  
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.totalPosts}</div>
                <p className="text-xs text-muted-foreground">{adminStats?.totalArticles} knowledge articles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{adminStats?.pendingReports}</div>
                <p className="text-xs text-muted-foreground">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {user.name
                            .split(" ")
                            .map((n: any[]) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground">Last active {formatTimeAgo(user.lastActive)}</p>
                      </div>
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsRes?.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.posts} posts</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{category.engagement}%</p>
                        <p className="text-xs text-muted-foreground">engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Input placeholder="Search users..." className="w-64" />
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userStatusOptions.map((option) => (
                    <SelectItem key={option._id} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n: any[]) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.name}</h3>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : user.role === "moderator" ? "secondary" : "outline"
                            }
                          >
                            {user.role}
                          </Badge>
                          <Badge variant={user.status === "active" ? "default" : "destructive"} className="text-xs">
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.department} • Joined {new Date(user.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-medium">{user.points} points</p>
                        <p className="text-muted-foreground">
                          {user.postsCount} posts • {user.articlesCount} articles
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsUserDialogOpen(true)
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {user.status === "active" ? (
                          <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, "suspend")}>
                            <Ban className="w-3 h-3 mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, "activate")}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Forum Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.totalPosts}</div>
                <p className="text-sm text-muted-foreground">Total discussions</p>
                <div className="mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Moderate Posts
                  </Button>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Flagged Content
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Knowledge Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.totalArticles}</div>
                <p className="text-sm text-muted-foreground">Published articles</p>
                <div className="mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Review Articles
                  </Button>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Manage Categories
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Gamification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-sm text-muted-foreground">Active badges</p>
                <div className="mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Manage Badges
                  </Button>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Point System
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" />
                Content Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports
                  .filter((report) => report.status === "pending")
                  .map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(report.priority)}>{report.priority} priority</Badge>
                            <Badge variant="outline">{report.type.replace("_", " ")}</Badge>
                          </div>
                          <h4 className="font-semibold">Report against {report.targetUser}</h4>
                          <p className="text-sm text-muted-foreground">
                            Reported by {report.reportedBy} • {formatTimeAgo(report.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleReportAction(report.id, "reject")}>
                            <XCircle className="w-3 h-3 mr-1" />
                            Dismiss
                          </Button>
                          <Button variant="default" size="sm" onClick={() => handleReportAction(report.id, "approve")}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Take Action
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Content:</strong> {report.targetContent}
                        </p>
                        <p className="text-sm">
                          <strong>Reason:</strong> {report.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                {reports.filter((report) => report.status === "pending").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                    <p className="text-muted-foreground">No pending reports</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.engagementRate}%</div>
                <p className="text-xs text-muted-foreground">+5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.averageSessionTime}</div>
                <p className="text-xs text-muted-foreground">+3m from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminStats?.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Peak: 94 users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Content Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+23%</div>
                <p className="text-xs text-muted-foreground">Posts this month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Community Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">Detailed analytics and reporting coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                  <AvatarFallback>
                    {selectedUser.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant={
                        selectedUser.role === "admin"
                          ? "default"
                          : selectedUser.role === "moderator"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {selectedUser.role}
                    </Badge>
                    <Badge variant={selectedUser.status === "active" ? "default" : "destructive"}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-muted-foreground">{selectedUser.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Joined</p>
                  <p className="text-muted-foreground">{new Date(selectedUser.joinedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Points</p>
                  <p className="text-muted-foreground">{selectedUser.points}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Active</p>
                  <p className="text-muted-foreground">{formatTimeAgo(selectedUser.lastActive)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    handleUserAction(selectedUser.id, selectedUser.role === "member" ? "promote" : "demote")
                  }
                >
                  {selectedUser.role === "member" ? "Promote to Moderator" : "Demote"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleUserAction(selectedUser.id, selectedUser.status === "active" ? "suspend" : "activate")
                  }
                >
                  {selectedUser.status === "active" ? "Suspend User" : "Activate User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
