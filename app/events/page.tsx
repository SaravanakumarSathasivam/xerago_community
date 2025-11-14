"use client";

import { CommunityDashboard } from "@/components/dashboard/community-dashboard";
import { EventsPortal } from "@/components/events/events-portal";
import { useRef } from "react";
import { BackToTop } from "@/components/ui/back-to-top";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  let user = localStorage.getItem('xerago-user');
  if (user) {
    user = JSON.parse(user);
  }

  const handleLogout = () => {
    user = null;
    localStorage.removeItem('xerago-user');
    router.push('/login');
  };

  return (
    <CommunityDashboard user={user} onLogout={handleLogout}>
      <div ref={scrollContainerRef} className="relative h-[calc(100vh-theme(spacing.16))] overflow-y-auto pr-4">
        <EventsPortal user={user} />
        <BackToTop scrollContainerRef={scrollContainerRef} />
      </div>
    </CommunityDashboard>
  );
}
