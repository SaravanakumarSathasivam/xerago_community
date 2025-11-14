"use client";
import { useRef, useState, useEffect } from "react";
import { KnowledgeBase } from "@/components/knowledge/knowledge-base"
import { BackToTop } from "@/components/ui/back-to-top";
import { CommunityDashboard } from "@/components/dashboard/community-dashboard";
import { LoginForm } from "@/components/auth/login-form";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function Knowledge() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("xerago-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem("xerago-user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("xerago-user");
  };

  if (loading) {
    return <LogoLoader />;
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <CommunityDashboard user={user} onLogout={handleLogout}>
      <div ref={scrollContainerRef} className="relative h-[calc(100vh-theme(spacing.16))] overflow-y-auto pr-4">
        <KnowledgeBase user={user} />
        <BackToTop scrollContainerRef={scrollContainerRef} />
      </div>
    </CommunityDashboard>
  );
}
