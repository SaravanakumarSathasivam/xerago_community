import { useEffect, useState, ReactNode } from "react";
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
  LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { getTopContributors } from "@/lib/api";
import { WelcomePopup } from "@/components/ui/welcome-popup";
import { IUser } from "@/models/user";
import { MainNavTabs } from "@/components/ui/main-nav-tabs";

interface ITopContributor {
  id: string;
  name: string;
  avatar?: string;
  contribution: number;
  points: number;
}

interface CommunityDashboardProps {
  user: IUser | null;
  onLogout: () => void;
  children: ReactNode;
}

export function CommunityDashboard({
  user,
  onLogout,
  children,
}: CommunityDashboardProps) {
  const currentUser = user
    ? user
    : JSON.parse(localStorage.getItem("xerago-user") || "{}");

  const isAdmin = currentUser?.role === "admin";
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [searchQuery, setSearchQuery] = useState("");

  const [topContributors, setTopContributors] = useState<ITopContributor[]>([]);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const res = await getTopContributors();
        setTopContributors(
          res.data.topContributors.map((tc) => ({
            id: tc._id,
            name: tc.name,
            avatar: tc.avatar,
            contribution: tc.gamification?.totalMonthlyContributions || 0,
            points: tc.gamification?.points || 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching top contributors:", error);
      }
    };

    fetchTopContributors();
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

  return (
    <div className="min-h-screen bg-background">
      {showWelcomePopup && (
        <WelcomePopup
          userName={currentUser?.name}
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
                        {currentUser?.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block">
                      <p className="text-sm font-medium">{currentUser?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser?.department}
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
                      {currentUser?.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{currentUser?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentUser?.department}
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
                    {currentUser?.gamification?.points}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Level</span>
                  <Badge variant="outline">
                    Level {currentUser?.gamification?.level}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <span className="text-sm">Badges</span>
                  <div className="flex flex-wrap gap-1">
                    {currentUser?.gamification?.badges?.map(
                      (badge: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {badge}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Top Contributors (Monthly)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topContributors.length > 0 ? (
                  <div className="space-y-3">
                    {topContributors.map((contributor: ITopContributor, ind: number) => (
                      <div
                        key={`${contributor.id}-${ind}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {contributor.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {contributor.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {contributor.contribution} Contributions
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {contributor.points} Points
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No contributors yet this month.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <MainNavTabs isAdmin={isAdmin} />

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
