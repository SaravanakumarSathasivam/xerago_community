"use client";
import { useRef, useState, useEffect } from "react";
import { DiscussionForums } from "@/components/forums/discussion-forums";
import { BackToTop } from "@/components/ui/back-to-top";
import { CommunityDashboard } from "@/components/dashboard/community-dashboard";
import { LoginForm } from "@/components/auth/login-form";
import { LogoLoader } from "@/components/ui/logo-loader";
import { IUser } from "@/models/user";
import { useRouter } from "next/navigation";

export default function Forums() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("xerago-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
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

  if (loading) {
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
        <DiscussionForums user={user} />
        <BackToTop scrollContainerRef={scrollContainerRef} />
      </div>
    </CommunityDashboard>
  );
}
