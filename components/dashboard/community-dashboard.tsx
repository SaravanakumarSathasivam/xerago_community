"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Search,
  Plus,
  MessageSquare,
  Trophy,
  BookOpen,
  Users,
  TrendingUp,
  LogOut,
  Settings,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Leaderboard } from "@/components/gamification/leaderboard";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { EventsPortal } from "@/components/events/events-portal";
import { WelcomePopup } from "@/components/ui/welcome-popup";
import { getFeed, getTopContributors } from "@/lib/api";
import { formatTimestamp } from "@/helper/helper";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface CommunityDashboardProps {
  user: any;
  onLogout: () => void;
  children: ReactNode;
}

export function CommunityDashboard({
  user,
  onLogout,
  children,
}: CommunityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = user.role === "admin";

  const [feedActivities, setFeedActivities] = useState<any[]>([]);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(true);

  const [topContributors, setTopContributors] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const res = await getTopContributors();
        setTopContributors(res.data.topContributors);
      } catch (error) {
        console.error("Error fetching top contributors:", error);
      }
    };

    fetchTopContributors();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getFeed(1, 5);
        setFeedActivities(res.data.items);
        setFeedPage(1);
        setFeedHasMore(res.data.page < res.data.totalPages);
      } catch {}
    })();
  }, []);

  // Minimal inactivity auto-logout (frontend)
  useEffect(() => {
    const maxIdleMs = 30 * 60 * 1000; // 30 minutes
    const onAnyActivity = () => setLastActivity(Date.now());
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > maxIdleMs) {
        try {
          localStorage.removeItem("xerago-token");
        } catch {}
        onLogout();
      }
    }, 60 * 1000);
    window.addEventListener("mousemove", onAnyActivity);
    window.addEventListener("keydown", onAnyActivity);
    window.addEventListener("click", onAnyActivity);
    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", onAnyActivity);
      window.removeEventListener("keydown", onAnyActivity);
      window.removeEventListener("click", onAnyActivity);
    };
  }, [lastActivity, onLogout]);

  const loadMoreFeed = async () => {
    try {
      const nextPage = feedPage + 1;
      const res = await getFeed(nextPage, 5);
      setFeedActivities((prev) => [...prev, ...res.data.items]);
      setFeedPage(nextPage);
      setFeedHasMore(res.data.page < res.data.totalPages);
    } catch {}
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "article":
        return <BookOpen className="w-4 h-4" />;
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "discussion":
        return <MessageSquare className="w-4 h-4" />;
      case "achievement":
        return <Trophy className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "article":
        return "bg-emerald-100 text-emerald-700";
      case "event":
        return "bg-green-100 text-green-700";
      case "discussion":
        return "bg-teal-100 text-teal-700";
      case "achievement":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  useEffect(() => {
    const tempActiveTab = localStorage.getItem("activeTab");
    if (tempActiveTab) {
      // setActiveTab(tempActiveTab); // This line is removed
      localStorage.setItem("activeTab", tempActiveTab);
    } else {
      // setActiveTab("feed"); // This line is removed
      localStorage.setItem("activeTab", "feed");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {showWelcomePopup && (
        <WelcomePopup
          userName={user.name}
          onClose={() => setShowWelcomePopup(false)}
        />
      )}

      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md border border-emerald-500/20"
                style={{
                  background: "linear-gradient(to right, #249e5e, #16a34a)",
                }}
              >
                <span className="text-lg font-bold text-gray-900">XM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Xerago Martech Minds</h1>
                <p className="text-sm text-muted-foreground">
                  Internal Community Portal
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search discussions, knowledge..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-3 cursor-pointer">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.department}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      if (typeof window !== "undefined")
                        window.location.href = "/account/profile";
                    }}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Stats */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.department}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Points</span>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700"
                  >
                    {user.points}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Level</span>
                  <Badge variant="outline">Level {user.level}</Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-sm">Badges</span>
                  <div className="flex flex-wrap gap-1">
                    {user.badges.map((badge: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Contributors (Monthly)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topContributors.length > 0 ? (
                  <div className="space-y-3">
                    {topContributors.map((contributor) => (
                      <div key={contributor.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {contributor.name.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{contributor.name}</p>
                            <p className="text-xs text-muted-foreground">{contributor.contribution} Contributions</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{contributor.points} Points</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No contributors yet this month.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div
              className={`flex h-10 items-center justify-between gap-2 border-b text-sm font-medium
                ${isAdmin ? "grid-cols-6" : "grid-cols-5"}
              }`}
            >
              <Link
                href="/"
                className={`flex flex-1 items-center justify-center gap-2 px-3 py-2 text-center transition-all hover:bg-muted
                  ${pathname === "/" ? "bg-muted text-foreground" : "text-muted-foreground"}
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Feed</span>
              </Link>
              <Link
                href="/forums"
                className={`flex flex-1 items-center justify-center gap-2 px-3 py-2 text-center transition-all hover:bg-muted
                  ${pathname === "/forums" ? "bg-muted text-foreground" : "text-muted-foreground"}
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Forums</span>
              </Link>
              <Link
                href="/knowledge"
                className={`flex flex-1 items-center justify-center gap-2 px-3 py-2 text-center transition-all hover:bg-muted
                  ${pathname === "/knowledge" ? "bg-muted text-foreground" : "text-muted-foreground"}
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Knowledge</span>
              </Link>
              <Link
                href="/events"
                className={`flex flex-1 items-center justify-center gap-2 px-3 py-2 text-center transition-all hover:bg-muted
                  ${pathname === "/events" ? "bg-muted text-foreground" : "text-muted-foreground"}
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Events</span>
              </Link>
              <Link
                href="/leaderboard"
                className={`flex flex-1 items-center justify-center gap-2 px-3 py-2 text-center transition-all hover:bg-muted
                  ${pathname === "/leaderboard" ? "bg-muted text-foreground" : "text-muted-foreground"}
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex flex-1 items-center justify-center gap-2 px-3 py-2 text-center transition-all hover:bg-muted
                    ${pathname === "/admin" ? "bg-muted text-foreground" : "text-muted-foreground"}
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
