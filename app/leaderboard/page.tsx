"use client";

import { CommunityDashboard } from "@/components/dashboard/community-dashboard";
import { Leaderboard } from "@/components/gamification/leaderboard";
import { useRef } from "react";
import { BackToTop } from "@/components/ui/back-to-top";
import { useRouter } from "next/navigation";
import { IUser } from "@/models/user";

export default function LeaderboardPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  let user: IUser | null = null;
  let storedUser = localStorage.getItem('xerago-user');
  if (storedUser) {
    user = JSON.parse(storedUser);
}

  const handleLogout = () => {
    user = null;
    localStorage.removeItem('xerago-user');
    router.push('/');
  };

  return (
    <CommunityDashboard user={user} onLogout={handleLogout}>
      <div ref={scrollContainerRef} className="relative h-[calc(100vh-theme(spacing.16))] overflow-y-auto pr-4">
        <Leaderboard currentUser={user} />
        <BackToTop scrollContainerRef={scrollContainerRef} />
      </div>
    </CommunityDashboard>
  );
}
