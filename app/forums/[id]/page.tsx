"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getForumPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ForumDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const res = await getForumPost(id);
        setPost(res.data.post);
      } catch (e: any) {
        setError(e?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error || !post) return <div className="p-6">{error || "Post not found"}</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <div className="flex items-center gap-3 mt-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.author?.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {post.author?.name?.split(" ")?.map((x: string) => x[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              {post.author?.name}
            </div>
            <Badge variant="outline" className="text-xs">{post.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {post.content}
          </div>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {post.tags.map((t: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">#{t}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


