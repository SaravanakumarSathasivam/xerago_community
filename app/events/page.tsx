"use client";

import { CommunityDashboard } from "@/components/dashboard/community-dashboard";
import { EventsPortal } from "@/components/events/events-portal";
import { useRef, useState, useEffect } from "react";
import { BackToTop } from "@/components/ui/back-to-top";
import { useRouter } from "next/navigation";
import { IUser } from "@/models/user";
import { getEvents } from "@/lib/api";
import { IEvent } from "@/models/event";
import { LogoLoader } from "@/components/ui/logo-loader";

export default function EventsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("xerago-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingEvents(true);
      try {
        const res = await getEvents();
        setEvents(res.data.events || []);
      } catch (e: unknown) {
        console.error("Failed to fetch initial events:", e);
      } finally {
        setLoadingEvents(false);
      }
    })();
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("xerago-user");
    router.push("/");
  };

  if (loading || loadingEvents) {
    return <LogoLoader />;
  }

  if (!user) {
    // Assuming LoginForm would be rendered here if user is null, or redirected to login page
    // For now, we'll just return null or a loading indicator if user is unexpectedly null after initial load
    return <LogoLoader />;
  }

  return (
    <CommunityDashboard user={user as IUser} onLogout={handleLogout}>
      <div ref={scrollContainerRef} className="relative h-[calc(100vh-theme(spacing.16))] overflow-y-auto pr-4">
        <EventsPortal user={user as IUser} initialEvents={events} initialLoading={loadingEvents} />
        <BackToTop scrollContainerRef={scrollContainerRef} />
      </div>
    </CommunityDashboard>
  );
}
