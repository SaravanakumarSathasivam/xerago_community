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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  ThumbsUp,
  Bookmark,
  Share,
  FileText,
  Video,
  TrendingUp,
  Edit,
  Trash2,
  Paperclip,
} from "lucide-react";

import {
  getArticles,
  createArticle as apiCreateArticle,
  likeArticle,
  bookmarkArticle,
  createArticleForm,
  updateArticle,
  deleteArticle,
} from "@/lib/api";
import Swal from "sweetalert2";
import { useDropdownOptions } from "@/hooks/use-dropdown-options";
import { SectionLoader } from "@/components/ui/section-loader";
const mockArticles: any[] = [];

const MAX_FILE_SIZE_MB_KNOWLEDGE = 5;
const MAX_FILE_SIZE_BYTES_KNOWLEDGE = MAX_FILE_SIZE_MB_KNOWLEDGE * 1024 * 1024;

interface KnowledgeBaseProps {
  user: any;
}

export function KnowledgeBase({ user }: KnowledgeBaseProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [articles, setArticles] = useState<any[]>(mockArticles);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "",
    type: "",
    tags: "",
    difficulty: "Beginner",
  });
  const [newArticleErrors, setNewArticleErrors] = useState<any>({});
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef =
    null as any as React.MutableRefObject<HTMLInputElement | null>;
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [editArticleErrors, setEditArticleErrors] = useState<any>({});

  const isAdmin = user.role === "admin";

  // Fetch dropdown options from API
  const { options: articleCategories, loading: articleCategoriesLoading } =
    useDropdownOptions("article_category");
  const { options: articleTypes, loading: articleTypesLoading } =
    useDropdownOptions("article_type");
  const { options: difficultyLevels, loading: difficultyLevelsLoading } =
    useDropdownOptions("article_difficulty");
  const { options: sortOptions, loading: sortOptionsLoading } =
    useDropdownOptions("article_sort");

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "all" ||
      article.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === "popular") {
      return (b.views || 0) - (a.views || 0);
    } else if (sortBy === "likes") {
      return (b.likes || 0) - (a.likes || 0);
    } else if (sortBy === "bookmarks") {
      return (b.bookmarks || 0) - (a.bookmarks || 0);
    }
    return 0;
  });

  const handleLike = async (articleId: string) => {
    try {
      const res = await likeArticle(articleId);
      const updated = res.data.article;
      setArticles((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
    } catch {}
  };

  const handleBookmark = async (articleId: string) => {
    try {
      const res = await bookmarkArticle(articleId);
      const updated = res.data.article;
      setArticles((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
    } catch {}
  };

  const handleCreateArticle = async () => {
    const errors: any = {};
    if (!newArticle.title) errors.title = "Title is required";
    if (!newArticle.content) errors.content = "Content is required";
    if (!newArticle.category) errors.category = "Category is required";
    if (!newArticle.type) errors.type = "Type is required";

    if (Object.keys(errors).length > 0) {
      setNewArticleErrors(errors);
      return;
    }
    setNewArticleErrors({});
    try {
      const form = new FormData();
      form.append("title", newArticle.title);
      form.append("content", newArticle.content);
      form.append("category", newArticle.category);
      form.append("type", newArticle.type);
      form.append("tags", newArticle.tags);
      form.append("difficulty", newArticle.difficulty);
      files.forEach((f) => form.append("images", f));
      const res = await createArticleForm(form);
      const created = res.data.article;
      setArticles((prev) => [{ ...created }, ...prev]);
      Swal.fire({
        icon: "success",
        title: "Article submitted",
        text: "Your article was submitted for approval.",
      });
    } catch {}

    setNewArticle({
      title: "",
      content: "",
      category: "",
      type: "",
      tags: "",
      difficulty: "Beginner",
    });
    setFiles([]);
    setIsCreateDialogOpen(false);
  };

  const onViewArticle = (article: any) => {
    if (typeof window !== "undefined")
      window.location.href = `/knowledge/${article.id}`;
  };

  const onEditArticle = (article: any) => {
    setEditing({
      id: article.id,
      title: article.title,
      content: article.content,
      category: article.category,
      type: article.type,
      tags: (article.tags || []).join(", "),
      difficulty: article.difficulty || "Beginner",
    });
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editing) return;

    const errors: any = {};
    if (!editing.title) errors.title = "Title is required";
    if (!editing.content) errors.content = "Content is required";
    if (!editing.category) errors.category = "Category is required";
    if (!editing.type) errors.type = "Type is required";

    if (Object.keys(errors).length > 0) {
      setEditArticleErrors(errors);
      return;
    }
    setEditArticleErrors({});

    try {
      const res = await updateArticle(editing.id, {
        title: editing.title,
        content: editing.content,
        category: editing.category,
        type: editing.type,
        tags: editing.tags,
        difficulty: editing.difficulty,
      });
      const updated = res.data.article;
      setArticles((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );
      setEditOpen(false);
      setEditing(null);
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Article updated successfully.",
      });
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: e?.message || "Please try again.",
      });
    }
  };

  const onDeleteArticle = async (article: any) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete article?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteArticle(article.id);
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Article deleted.",
      });
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text: e?.message || "Please try again.",
      });
    }
  };

  useEffect(() => {
    (async () => {
      setLoadingArticles(true);
      try {
        const params: {
          category?: string;
          sort?: string;
          order?: "asc" | "desc";
        } = {};
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (sortBy) {
          params.sort = sortBy;
          params.order = "desc";
        }

        const res = await getArticles(params);
        const allArticles = res.data.articles || [];
        setArticles(allArticles);
      } catch (e) {
        console.error("Failed to fetch articles:", e);
      } finally {
        setLoadingArticles(false);
      }
    })();
  }, [selectedCategory, sortBy, isAdmin]);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "Advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Guide":
        return <BookOpen className="w-4 h-4" />;
      case "Tutorial":
        return <Video className="w-4 h-4" />;
      case "Checklist":
        return <FileText className="w-4 h-4" />;
      case "Comparison":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const categories = [
    { id: "all", name: "All Categories", count: articles.filter((a) => a.status === "published").length },
    ...articleCategories.map((cat) => ({
      id: cat.value,
      name: cat.label,
      count: articles.filter(
        (a) => a.category.toLowerCase() === cat.value.toLowerCase() && a.status === "published"
      ).length,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Knowledge Base</h2>
          <p className="text-muted-foreground">
            Share and discover valuable insights and resources
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Share Knowledge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Share Your Knowledge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Enter article title"
                    value={newArticle.title}
                    onChange={(e) =>
                      setNewArticle({ ...newArticle, title: e.target.value })
                    }
                  />
                  {newArticleErrors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {newArticleErrors.title}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={newArticle.category}
                    onValueChange={(value) =>
                      setNewArticle({ ...newArticle, category: value })
                    }
                  >
                    <SelectTrigger
                      className={
                        newArticleErrors.category ? "border-red-500" : ""
                      }
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newArticleErrors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {newArticleErrors.category}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newArticle.type}
                    onValueChange={(value) =>
                      setNewArticle({ ...newArticle, type: value })
                    }
                  >
                    <SelectTrigger
                      className={newArticleErrors.type ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {articleTypes.map((type) => (
                        <SelectItem key={type._id} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newArticleErrors.type && (
                    <p className="text-red-500 text-xs mt-1">
                      {newArticleErrors.type}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={newArticle.difficulty}
                    onValueChange={(value) =>
                      setNewArticle({ ...newArticle, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level._id} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  placeholder="Share your knowledge, insights, and best practices..."
                  rows={8}
                  value={newArticle.content}
                  onChange={(e) =>
                    setNewArticle({ ...newArticle, content: e.target.value })
                  }
                  className={newArticleErrors.content ? "border-red-500" : ""}
                />
                {newArticleErrors.content && (
                  <p className="text-red-500 text-xs mt-1">
                      {newArticleErrors.content}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Attachments (max 3 files, {MAX_FILE_SIZE_MB_KNOWLEDGE}MB each)</label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);
                    const validFiles = selectedFiles.filter((file) => {
                      if (file.size > MAX_FILE_SIZE_BYTES_KNOWLEDGE) {
                        Swal.fire({
                          icon: "error",
                          title: "File Too Large",
                          text: `File ${file.name} exceeds the ${MAX_FILE_SIZE_MB_KNOWLEDGE}MB limit.`,
                        });
                        return false;
                      }
                      return true;
                    });
                    setFiles(validFiles);
                  }}
                />
                {files.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {files.length} file(s) selected
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateArticle} className="flex-1">
                  Publish Article
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
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={
              selectedCategory === category.id ? "default" : "outline"
            }
            onClick={() => setSelectedCategory(category.id)}
            size="sm"
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search knowledge base..."
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
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loadingArticles ? (
          <SectionLoader />
        ) : sortedArticles.map((article) => (
          <Card
            key={article.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onViewArticle(article)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(article.type)}
                  <Badge variant="outline" className="text-xs">
                    {article.type}
                  </Badge>
                  <Badge
                    className={`text-xs ${getDifficultyColor(
                      article.difficulty
                    )}`}
                  >
                    {article.difficulty}
                  </Badge>
                  {(isAdmin || article.author.name === user.name) &&
                    article.status !== "published" && (
                      <Badge className="text-xs bg-orange-100 text-orange-700 capitalize">
                        {article.status}
                      </Badge>
                    )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {article.readTime} min read
                </div>
              </div>
              <CardTitle className="text-lg text-balance">
                {article.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-pretty line-clamp-3">
                {article.content}
              </p>
              <div>
                <Button
                  variant="link"
                  className="px-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewArticle(article);
                  }}
                >
                  … Learn more
                </Button>
              </div>

              <div className="flex flex-wrap gap-1">
                {article.tags
                  .slice(0, 3)
                  .map(
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
                        variant="secondary"
                        className="text-xs"
                      >
                        #{tag}
                      </Badge>
                    )
                  )}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={article.author.avatar || "/placeholder.svg"}
                      alt={article.author.name}
                    />
                    <AvatarFallback className="text-xs">
                      {article.author.name
                        .split(" ")
                        .map((n: any[]) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">
                      {article.author.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(article.updatedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {article.views}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(article.id);
                    }}
                    className={`p-1 h-auto ${
                      article.isLiked ? "text-red-500" : ""
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3 h-3 ${
                        article.isLiked ? "fill-current" : ""
                      }`}
                    />
                    <span className="ml-1 text-xs">{article.likes}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(article.id);
                    }}
                    className={`p-1 h-auto ${
                      article.isBookmarked ? "text-blue-500" : ""
                    }`}
                  >
                    <Bookmark
                      className={`w-3 h-3 ${
                        article.isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      const origin =
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "";
                      const url = `${origin}/knowledge/${article.id}`;
                      setShareUrl(url);
                      setShareOpen(true);
                    }}
                  >
                    <Share className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Article</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
              }}
            >
              Copy link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={editing.title}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                  />
                  {editArticleErrors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {editArticleErrors.title}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={editing.category}
                    onChange={(e) =>
                      setEditing({ ...editing, category: e.target.value })
                    }
                  />
                  {editArticleErrors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {editArticleErrors.category}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Input
                    value={editing.type}
                    onChange={(e) =>
                      setEditing({ ...editing, type: e.target.value })
                    }
                  />
                  {editArticleErrors.type && (
                    <p className="text-red-500 text-xs mt-1">
                      {editArticleErrors.type}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select
                    value={editing.difficulty}
                    onValueChange={(value) =>
                      setEditing({ ...editing, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level._id} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  rows={8}
                  value={editing.content}
                  onChange={(e) =>
                    setEditing({ ...editing, content: e.target.value })
                  }
                />
                {editArticleErrors.content && (
                  <p className="text-red-500 text-xs mt-1">
                    {editArticleErrors.content}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  Tags (comma-separated)
                </label>
                <Input
                  value={editing.tags}
                  onChange={(e) =>
                    setEditing({ ...editing, tags: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={onSaveEdit}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
