"use client";
import { useRef, useState, useEffect } from "react";
import { DiscussionForums } from "@/components/forums/discussion-forums";
import { BackToTop } from "@/components/ui/back-to-top";
import { CommunityDashboard } from "@/components/dashboard/community-dashboard";
import { LoginForm } from "@/components/auth/login-form";
import { LogoLoader } from "@/components/ui/logo-loader";
import { IUser } from "@/models/user";
import { useRouter } from "next/navigation";
import { getForumPosts } from "@/lib/api";
import { IForum } from "@/models/forum";

export default function Forums() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [forumPosts, setForumPosts] = useState<IForum[]>([]);
  const [loadingForumPosts, setLoadingForumPosts] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("xerago-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingForumPosts(true);
      try {
        const res = await getForumPosts();
        setForumPosts(res.data.posts || []);
      } catch (e: unknown) {
        console.error("Failed to fetch initial forum posts:", e);
      } finally {
        setLoadingForumPosts(false);
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
    router.push("/");
  };

  if (loading || loadingForumPosts) {
    return <LogoLoader />;
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <CommunityDashboard user={user} onLogout={handleLogout}>
      <div
        ref={scrollContainerRef}
        className="relative h-[calc(100vh-theme(spacing.16))] overflow-y-auto pr-4"
      >
        <DiscussionForums user={user} initialPosts={forumPosts} initialLoading={loadingForumPosts} />
        <BackToTop scrollContainerRef={scrollContainerRef} />
      </div>
    </CommunityDashboard>
  );
}
