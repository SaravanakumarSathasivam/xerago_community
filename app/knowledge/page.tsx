"use client";
import { useRef, useState, useEffect } from "react";
import { KnowledgeBase } from "@/components/knowledge/knowledge-base"
import { BackToTop } from "@/components/ui/back-to-top";
import { CommunityDashboard } from "@/components/dashboard/community-dashboard";
import { LoginForm } from "@/components/auth/login-form";
import { LogoLoader } from "@/components/ui/logo-loader";
import { IUser } from "@/models/user";
import { getArticles } from "@/lib/api";
import { IArticle } from "@/models/article";

export default function Knowledge() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("xerago-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingArticles(true);
      try {
        const res = await getArticles();
        setArticles(res.data.articles || []);
      } catch (e: unknown) {
        console.error("Failed to fetch initial articles:", e);
      } finally {
        setLoadingArticles(false);
      }
    })();
  }, []);

  const handleLogin = (userData: IUser) => {
    setUser(userData);
    localStorage.setItem("xerago-user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("xerago-user");
  };

  if (loading || loadingArticles) {
    return <LogoLoader />;
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <CommunityDashboard user={user} onLogout={handleLogout}>
      <div ref={scrollContainerRef} className="relative h-[calc(100vh-theme(spacing.16))] overflow-y-auto pr-4">
        <KnowledgeBase user={user} initialArticles={articles} initialLoading={loadingArticles} />
        <BackToTop scrollContainerRef={scrollContainerRef} />
      </div>
    </CommunityDashboard>
  );
}
