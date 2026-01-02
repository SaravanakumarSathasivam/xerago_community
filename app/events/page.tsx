"use client";

import { CommunityDashboard } from "@/components/dashboard/community-dashboard";
import { EventsPortal } from "@/components/events/events-portal";
import { useRef } from "react";
import { BackToTop } from "@/components/ui/back-to-top";
import { useRouter } from "next/navigation";
import { IUser } from "@/models/user";

export default function EventsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
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
    <CommunityDashboard user={user as IUser} onLogout={handleLogout}>
      <div ref={scrollContainerRef} className="relative h-[calc(100vh-theme(spacing.16))] overflow-y-auto pr-4">
        <EventsPortal user={user as IUser} />
        <BackToTop scrollContainerRef={scrollContainerRef} />
      </div>
    </CommunityDashboard>
  );
}
