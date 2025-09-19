"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, ThumbsUp, Reply, Plus, Search, Filter, Clock, TrendingUp } from "lucide-react"

// Mock data for forums
const forumCategories = [
  {
    id: "general",
    name: "General Discussion",
    description: "Open discussions about work and life",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "tech",
    name: "Tech Talk",
    description: "Technology discussions and troubleshooting",
    color: "bg-green-100 text-green-700",
  },
  {
    id: "marketing",
    name: "Marketing Insights",
    description: "Share marketing strategies and campaigns",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "analytics",
    name: "Data & Analytics",
    description: "Data insights and analytics discussions",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "ai",
    name: "AI & Innovation",
    description: "AI tools and innovative solutions",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: "announcements",
    name: "Announcements",
    description: "Company updates and important news",
    color: "bg-red-100 text-red-700",
  },
]

const mockPosts = [
  {
    id: "1",
    title: "New AI Tools for Marketing Automation",
    content:
      "Has anyone tried the new AI tools for marketing automation? I'm curious about the ROI and implementation challenges.",
    author: {
      name: "Sarah Chen",
      department: "Marketing",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    category: "ai",
    createdAt: "2024-01-15T10:30:00Z",
    likes: 12,
    replies: 8,
    tags: ["AI", "Marketing", "Automation"],
    isLiked: false,
  },
  {
    id: "2",
    title: "Q4 Analytics Review - Key Insights",
    content:
      "Sharing some key insights from our Q4 analytics review. The customer acquisition trends are particularly interesting this quarter.",
    author: {
      name: "Mike Rodriguez",
      department: "Digital Analytics",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    },
    category: "analytics",
    createdAt: "2024-01-14T15:45:00Z",
    likes: 18,
    replies: 15,
    tags: ["Analytics", "Q4", "Insights"],
    isLiked: true,
  },
  {
    id: "3",
    title: "CMS Migration Best Practices",
    content:
      "We're planning a CMS migration next quarter. Looking for best practices and lessons learned from similar projects.",
    author: {
      name: "Emily Johnson",
      department: "CMS",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    },
    category: "tech",
    createdAt: "2024-01-13T09:15:00Z",
    likes: 7,
    replies: 12,
    tags: ["CMS", "Migration", "Best Practices"],
    isLiked: false,
  },
  {
    id: "4",
    title: "Welcome New Team Members!",
    content:
      "Please join me in welcoming our new team members who joined this month. Looking forward to working with everyone!",
    author: {
      name: "David Park",
      department: "Product Management",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
    },
    category: "announcements",
    createdAt: "2024-01-12T14:20:00Z",
    likes: 25,
    replies: 6,
    tags: ["Welcome", "Team"],
    isLiked: true,
  },
]

interface DiscussionForumsProps {
  user: any
}

export function DiscussionForums({ user }: DiscussionForumsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [posts, setPosts] = useState(mockPosts)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "", tags: "" })

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === "popular") {
      return b.likes - a.likes
    } else if (sortBy === "discussed") {
      return b.replies - a.replies
    }
    return 0
  })

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post,
      ),
    )
  }

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content || !newPost.category) return

    const post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: { name: user.name, department: user.department, avatar: user.avatar },
      category: newPost.category,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      tags: newPost.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isLiked: false,
    }

    setPosts([post, ...posts])
    setNewPost({ title: "", content: "", category: "", tags: "" })
    setIsCreateDialogOpen(false)
  }

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

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discussion Forums</h2>
          <p className="text-muted-foreground">Connect and collaborate with your colleagues</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="What would you like to discuss?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newPost.category} onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {forumCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Share your thoughts, questions, or insights..."
                  rows={6}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  placeholder="e.g., AI, Marketing, Best Practices"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreatePost} className="flex-1">
                  Create Discussion
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className="h-auto p-3 flex flex-col items-center gap-1"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs">All</span>
        </Button>
        {forumCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="h-auto p-3 flex flex-col items-center gap-1"
          >
            <div className={`w-3 h-3 rounded-full ${category.color.split(" ")[0]}`} />
            <span className="text-xs text-center leading-tight">{category.name}</span>
          </Button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Most Recent
              </div>
            </SelectItem>
            <SelectItem value="popular">
              <div className="flex items-center">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Most Liked
              </div>
            </SelectItem>
            <SelectItem value="discussed">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Most Discussed
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {sortedPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
              <p className="text-muted-foreground mb-4">Be the first to start a conversation!</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start Discussion
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedPosts.map((post) => {
            const category = forumCategories.find((cat) => cat.id === post.category)
            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                        <AvatarFallback>
                          {post.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{post.author.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {post.author.department}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
                      </div>
                    </div>
                    {category && <Badge className={category.color}>{category.name}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-balance">{post.title}</h4>
                    <p className="text-muted-foreground text-pretty">{post.content}</p>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={post.isLiked ? "text-blue-600" : ""}
                      >
                        <ThumbsUp className={`w-4 h-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Reply className="w-4 h-4 mr-1" />
                        {post.replies}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Discussion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
