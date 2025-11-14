"use client";

import {
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
  Edit,
  Trash2,
  Paperclip,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Eye, CheckCircle, XCircle } from "lucide-react";

import {
  getForumPosts,
  getForumPost,
  createForumPost as apiCreateForumPost,
  updateForumPost as apiUpdateForumPost,
  deleteForumPost as apiDeleteForumPost,
  likeForumPost,
  replyForumPost,
  likeForumReply,
} from "@/lib/api";
import Swal from 'sweetalert2'
import { useDropdownOptions } from "@/hooks/use-dropdown-options";
import { useRef } from "react";
import { SectionLoader } from "@/components/ui/section-loader";

const MAX_FILE_SIZE_MB_FORUM = 2;
const MAX_FILE_SIZE_BYTES_FORUM = MAX_FILE_SIZE_MB_FORUM * 1024 * 1024;

interface DiscussionForumsProps {
  user: any;
}

export function DiscussionForums({ user }: DiscussionForumsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showPendingApproval, setShowPendingApproval] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const isAdmin = user.role === "admin";

  // Fetch dropdown options from API
  const { options: forumCategories, loading: forumCategoriesLoading } = useDropdownOptions('forum_category');
  const { options: sortOptions, loading: sortOptionsLoading } = useDropdownOptions('forum_sort');

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery, sortBy, showPendingApproval]);

  const fetchPosts = async () => {
    try {
      const res = await getForumPosts({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        sort: sortBy,
        order: sortBy === 'recent' ? 'desc' : 'desc',
        approvalStatus: showPendingApproval ? "pending" : undefined,
      });
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchPostDetails = async (postId: string) => {
    try {
      const res = await getForumPost(postId);
      return res.data.post;
    } catch (error) {
      console.error('Failed to fetch post details:', error);
      return null;
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag: string) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  const getRepliesCount = (p: any) => (Array.isArray(p.replies) ? p.replies.length : (p.replies || 0));
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "popular") {
      return b.likes - a.likes;
    } else if (sortBy === "discussed") {
      return getRepliesCount(b) - getRepliesCount(a);
    }
    return 0;
  });

  const handleLike = async (postId: string) => {
    try {
      const res = await likeForumPost(postId);
      const updated = res.data.post;
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedPost?.id === postId) {
        setSelectedPost({ ...selectedPost, ...updated });
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleLikeReply = async (postId: string, replyId: string) => {
    try {
      const res = await likeForumReply(postId, replyId);
      const updated = res.data.post;
      setSelectedPost(updated);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (error) {
      console.error('Failed to like reply:', error);
    }
  };

  const handleCreatePost = async () => {
    try {
      const formData = new FormData();
      formData.append('title', editingPost?.title || '');
      formData.append('content', editingPost?.content || '');
      formData.append('category', editingPost?.category || '');
      formData.append('tags', JSON.stringify(editingPost?.tags || []));

      console.log(selectedFiles, 'selectedFiles');

      selectedFiles.forEach((file) => {
        console.log(file, 'file');
        formData.append('attachments', file);
      });

      for (const pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const res = await apiCreateForumPost(formData);
      const created = res.data.post;
      setPosts((prev) => [created, ...prev]);
      setEditingPost(null);
      setSelectedFiles([]);
      setFileInputKey((prev) => prev + 1);
      setIsCreateDialogOpen(false);
      Swal.fire({ icon: 'success', title: 'Post created', text: 'Your discussion was created.' })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Create failed', text: 'Failed to create post', timer: 3000 })
    }
  };

  const handleEditPost = async () => {
    if (!editingPost) return;
    try {
      const formData = new FormData();
      formData.append('title', editingPost.title);
      formData.append('content', editingPost.content);
      formData.append('category', editingPost.category);
      formData.append('tags', editingPost?.tags || []);

      selectedFiles.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await apiUpdateForumPost(editingPost.id, formData);
      const updated = res.data.post;
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedPost?.id === updated.id) {
        setSelectedPost(updated);
      }
      setEditingPost(null);
      setSelectedFiles([]);
      setFileInputKey((prev) => prev + 1);
      setIsEditDialogOpen(false);
      Swal.fire({ icon: 'success', title: 'Post updated', text: 'Changes saved.' })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: 'Failed to update post', timer: 3000 })
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await apiDeleteForumPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      if (selectedPost?.id === postId) {
        setIsViewDialogOpen(false);
        setSelectedPost(null);
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const handleViewPost = async (post: any) => {
    const fullPost = await fetchPostDetails(post.id);
    if (fullPost) {
      setSelectedPost(fullPost);
      setIsViewDialogOpen(true);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedPost) return;
    try {
      const res = await replyForumPost(selectedPost.id, { content: replyContent });
      const updated = res.data.post;
      setSelectedPost(updated);
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setReplyContent("");
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        if (file.size > MAX_FILE_SIZE_BYTES_FORUM) {
          Swal.fire({
            icon: "error",
            title: "File Too Large",
            text: `File \'${file.name}\' exceeds the ${MAX_FILE_SIZE_MB_FORUM} MB limit.`,
          });
          return false;
        }
        return true;
      });
      setSelectedFiles((prev) => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openEditDialog = (post: any) => {
    setEditingPost({
      id: post.id,
      title: post.title,
      content: post.content,
      category: post.category,
      tags: post.tags.join(', '),
    });
    setSelectedFiles([]);
    setFileInputKey((prev) => prev + 1);
    setIsEditDialogOpen(true);
  };

  const handleApprovePost = async (postId: string) => {
    try {
      const approveFormData = new FormData();
      approveFormData.append('approvalStatus', 'approved');
      await apiUpdateForumPost(postId, approveFormData);
      fetchPosts();
      Swal.fire({
        icon: "success",
        title: "Post Approved",
        text: "The forum post has been approved.",
      });
    } catch (error) {
      console.error("Failed to approve post:", error);
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text: "There was an error approving the post.",
      });
    }
  };

  const handleRejectPost = async (postId: string) => {
    try {
      const rejectFormData = new FormData();
      rejectFormData.append('approvalStatus', 'rejected');
      await apiUpdateForumPost(postId, rejectFormData);
      fetchPosts();
      Swal.fire({
        icon: "success",
        title: "Post Rejected",
        text: "The forum post has been rejected.",
      });
    } catch (error) {
      console.error("Failed to reject post:", error);
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text: "There was an error rejecting the post.",
      });
    }
  };

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

        <Button
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => {
            setEditingPost({ title: '', content: '', category: '', tags: '' });
            setSelectedFiles([]);
            setFileInputKey((prev) => prev + 1);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Discussion
        </Button>
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
                  {option.value === 'unanswered' && <MessageSquare className="w-4 h-4 mr-2" />}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Button
            variant={showPendingApproval ? "default" : "outline"}
            onClick={() => setShowPendingApproval(!showPendingApproval)}
            className="w-full sm:w-auto"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending Approval
          </Button>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loadingPosts ? (
          <SectionLoader />
        ) : sortedPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No discussions found
              </h3>
              <p className="text-muted-foreground mb-4">
                Be the first to start a conversation!
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}
              >
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
            const isAuthor = user?.id === post.author?.id || user?._id === post.author?.id;
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
                            .map((n: string) => n[0])
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
                          {post.isEdited && " • Edited"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {category && (
                        <Badge className={category.metadata?.color || 'bg-gray-100 text-gray-700'}>
                          {category.label}
                        </Badge>
                      )}
                      {post.approvalStatus === 'pending' && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Pending
                        </Badge>
                      )}
                    </div>
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

                  {post.attachments && post.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.attachments.map((attachment: any, index: number) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 border rounded text-sm hover:bg-muted"
                        >
                          <Paperclip className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{attachment.originalName}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag: string, index: number) => (
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
                        <ThumbsUp
                          className={`w-4 h-4 mr-1 ${
                            post.isLiked ? "fill-current" : ""
                          }`}
                        />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPost(post)}
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        {Array.isArray(post.replies) ? post.replies.length : (post.replies || 0)}
                      </Button>
                      {Array.isArray(post.attachments) && post.attachments.length > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />{post.attachments.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && post.approvalStatus === "pending" ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprovePost(post.id)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectPost(post.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPost(post)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {isAuthor && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(post)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* View Post Dialog with Replies */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-6">
              {/* Post Content */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={selectedPost.author.avatar || "/placeholder.svg"}
                        alt={selectedPost.author.name}
                      />
                      <AvatarFallback>
                        {selectedPost.author.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{selectedPost.author.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {selectedPost.author.department}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatTimeAgo(selectedPost.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                  {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.attachments.map((attachment: any, index: number) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 border rounded text-sm hover:bg-muted"
                        >
                          <Paperclip className="w-4 h-4" />
                          <span>{attachment.originalName}</span>
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(selectedPost.id)}
                      className={selectedPost.isLiked ? "text-blue-600" : ""}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 mr-1 ${
                          selectedPost.isLiked ? "fill-current" : ""
                        }`}
                      />
                      {selectedPost.likes}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Replies */}
              <div className="space-y-4">
                <h3 className="font-semibold">Replies ({selectedPost.replies?.length || 0})</h3>
                {selectedPost.replies && selectedPost.replies.length > 0 ? (
                  selectedPost.replies.map((reply: any) => (
                    <Card key={reply.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={reply.author.avatar || "/placeholder.svg"}
                              alt={reply.author.name}
                            />
                            <AvatarFallback>
                              {reply.author.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{reply.author.name}</h4>
                              {reply.isSolution && (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Solution
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {formatTimeAgo(reply.createdAt)}
                            </p>
                            <p className="text-sm whitespace-pre-wrap mb-2">{reply.content}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeReply(selectedPost.id, reply.id)}
                              className={reply.isLiked ? "text-blue-600" : ""}
                            >
                              <ThumbsUp
                                className={`w-3 h-3 mr-1 ${
                                  reply.isLiked ? "fill-current" : ""
                                }`}
                              />
                              {reply.likes}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No replies yet. Be the first to reply!</p>
                )}
              </div>

              {/* Reply Form */}
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      rows={3}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <Button onClick={handleReply} disabled={!replyContent.trim()}>
                      <Reply className="w-4 h-4 mr-2" />
                      Post Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Discussion</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="What would you like to discuss?"
                  value={editingPost.title}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={editingPost.category}
                  onValueChange={(value) =>
                    setEditingPost({ ...editingPost, category: value })
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
                  value={editingPost.content}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, content: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Tags (comma-separated)
                </label>
                <Input
                  placeholder="e.g., AI, Marketing, Best Practices"
                  value={typeof editingPost.tags === 'string' ? editingPost.tags : editingPost.tags.join(', ')}
                  onChange={(e) =>
                    setEditingPost({
                      ...editingPost,
                      tags: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Attachments (max 3 files, {MAX_FILE_SIZE_MB_FORUM}MB each)</label>
                <div className="flex items-center gap-2">
                  <input
                    key={fileInputKey}
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={selectedFiles.length >= 3}
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach Files
                  </Button>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditPost} className="flex-1" disabled={!editingPost.title || !editingPost.content || !editingPost.category}>
                  Update Discussion
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingPost(null);
                    setSelectedFiles([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}