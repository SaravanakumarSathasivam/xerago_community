"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getArticle } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function KnowledgeDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);
  const router = useRouter();
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const res = await getArticle(id);
        setArticle(res.data.article);
      } catch (e: any) {
        setError(e?.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error || !article) return <div className="p-6">{error || "Article not found"}</div>;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-4">
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => {
            // try {
            //   const tab = sessionStorage.getItem('kb:lastTab') || 'browse';
            //   const category = sessionStorage.getItem('kb:lastCategory') || 'all';
            //   const sort = sessionStorage.getItem('kb:lastSort') || 'recent';
            //   router.push(`/knowledge?tab=${encodeURIComponent(tab)}&category=${encodeURIComponent(category)}&sort=${encodeURIComponent(sort)}`);
            // } catch {
            //   router.push('/knowledge');
            // }
            router.push('/');
          }}
        >
          ← Back to Knowledge
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{article.title}</CardTitle>
          <div className="flex items-center gap-3 mt-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={article.author?.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {article.author?.name?.split(" ")?.map((x: string) => x[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              {article.author?.name}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {article.content}
          </div>
          {article.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {article.tags.map((t: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">#{t}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


