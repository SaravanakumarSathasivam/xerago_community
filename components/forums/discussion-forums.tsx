"use client";

import {
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  ThumbsUp,
  Reply,
  Plus,
  Search,
  Filter,
  Clock,
  TrendingUp,
} from "lucide-react";

import {
  getForumPosts,
  createForumPost as apiCreateForumPost,
  likeForumPost,
} from "@/lib/api";
import { useDropdownOptions } from "@/hooks/use-dropdown-options";
const mockPosts: any[] = [];

interface DiscussionForumsProps {
  user: any;
}

interface NewPost {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export function DiscussionForums({ user }: DiscussionForumsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [posts, setPosts] = useState<any[]>(mockPosts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState<NewPost>({
    title: "",
    content: "",
    category: "",
    tags: [],
  });

  // Fetch dropdown options from API
  const { options: forumCategories, loading: forumCategoriesLoading } = useDropdownOptions('forum_category');
  const { options: sortOptions, loading: sortOptionsLoading } = useDropdownOptions('forum_sort');

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "popular") {
      return b.likes - a.likes;
    } else if (sortBy === "discussed") {
      return b.replies - a.replies;
    }
    return 0;
  });

  const handleLike = async (postId: string) => {
    try {
      const res = await likeForumPost(postId);
      const updated = res.data.post;
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {}
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !newPost.category) return;
    const payload = {
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      tags: newPost.tags,
    };

    console.log(payload, "payload");
    try {
      const res = await apiCreateForumPost(payload);
      const created = res.data.post;
      setPosts((prev) => [created, ...prev]);
    } catch {}
    setNewPost({ title: "", content: "", category: "", tags: [] });
    setIsCreateDialogOpen(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await getForumPosts();
        setPosts(res.data.posts || []);
      } catch {}
    })();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Discussion Forums</h2>
          <p className="text-muted-foreground">
            Connect and collaborate with your colleagues
          </p>
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
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newPost.category}
                  onValueChange={(value) =>
                    setNewPost({ ...newPost, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {forumCategories.map((category) => (
                      <SelectItem key={category._id} value={category.value}>
                        {category.label}
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
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Tags (comma-separated)
                </label>
                <Input
                  placeholder="e.g., AI, Marketing, Best Practices"
                  value={newPost.tags}
                  onChange={(e) =>
                    setNewPost({
                      ...newPost,
                      tags: e.target.value
                        .split(",")
                        .map((tag: string) => tag.trim()),
                    })
                  }
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreatePost} className="flex-1">
                  Create Discussion
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
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
            key={category._id}
            variant={selectedCategory === category.value ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.value)}
            className="h-auto p-3 flex flex-col items-center gap-1"
          >
            <div
              className={`w-3 h-3 rounded-full ${category.metadata?.color || 'bg-gray-200'}`}
            />
            <span className="text-xs text-center leading-tight">
              {category.label}
            </span>
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
            {sortOptions.map((option) => (
              <SelectItem key={option._id} value={option.value}>
                <div className="flex items-center">
                  {option.value === 'recent' && <Clock className="w-4 h-4 mr-2" />}
                  {option.value === 'popular' && <ThumbsUp className="w-4 h-4 mr-2" />}
                  {option.value === 'discussed' && <TrendingUp className="w-4 h-4 mr-2" />}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {sortedPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No discussions found
              </h3>
              <p className="text-muted-foreground mb-4">
                Be the first to start a conversation!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start Discussion
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedPosts.map((post) => {
            const category = forumCategories.find(
              (cat) => cat.value === post.category
            );
            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={post.author.avatar || "/placeholder.svg"}
                          alt={post.author.name}
                        />
                        <AvatarFallback>
                          {post.author.name
                            .split(" ")
                            .map((n: any[]) => n[0])
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
                        <p className="text-sm text-muted-foreground">
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    {category && (
                      <Badge className={category.metadata?.color || 'bg-gray-100 text-gray-700'}>{category.label}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2 text-balance">
                      {post.title}
                    </h4>
                    <p className="text-muted-foreground text-pretty">
                      {post.content}
                    </p>
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map(
                        (
                          tag:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                any,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<AwaitedReactNode>
                            | null
                            | undefined,
                          index: Key | null | undefined
                        ) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        )
                      )}
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
                        <ThumbsUp
                          className={`w-4 h-4 mr-1 ${
                            post.isLiked ? "fill-current" : ""
                          }`}
                        />
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
            );
          })
        )}
      </div>
    </div>
  );
}
