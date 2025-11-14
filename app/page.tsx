"use client"

import { useState, useEffect, useRef } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { CommunityDashboard } from "@/components/dashboard/community-dashboard"
import { getFeed } from "@/lib/api";
import { formatTimestamp } from "@/helper/helper";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  MessageSquare,
  Trophy,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { BackToTop } from "@/components/ui/back-to-top";
import { LogoLoader } from "@/components/ui/logo-loader";
import { SectionLoader } from "@/components/ui/section-loader";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedActivities, setFeedActivities] = useState<any[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("xerago-user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingFeed(true);
      try {
        const res = await getFeed(1, 5);
        setFeedActivities(res.data.items);
        setFeedPage(1);
        setFeedHasMore(res.data.page < res.data.totalPages);
      } catch (e) {
        console.error("Failed to fetch feed activities:", e);
      } finally {
        setLoadingFeed(false);
      }
    })();
  }, []);

  const loadMoreFeed = async () => {
    setLoadingFeed(true);
    try {
      const nextPage = feedPage + 1;
      const res = await getFeed(nextPage, 5);
      setFeedActivities((prev) => [...prev, ...res.data.items]);
      setFeedPage(nextPage);
      setFeedHasMore(res.data.page < res.data.totalPages);
    } catch (e) {
      console.error("Failed to load more feed activities:", e);
    } finally {
      setLoadingFeed(false);
    }
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

  const handleLogin = (userData: any) => {
    setUser(userData)
    localStorage.setItem("xerago-user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("xerago-user")
  }

  if (loading) {
    return <LogoLoader />;
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <CommunityDashboard user={user} onLogout={handleLogout}>
      <div ref={scrollContainerRef} className="space-y-6 overflow-y-auto h-[calc(100vh-theme(spacing.16))] pr-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Community Feed</h3>
            <Badge variant="secondary">Latest Activity</Badge>
          </div>

          <div className="space-y-4">
            {loadingFeed ? (
              <SectionLoader />
            ) : (feedActivities.map((activity) => (
              <Card
                key={activity.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-full ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {activity.author?.name}
                        </span>
                        <span>•</span>
                        <span>{activity.author?.department}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-3">
                          {activity.engagement?.likes !== undefined && (
                            <span>
                              {activity.engagement.likes}{" "}
                              {activity.engagement.likes === 1
                                ? "like"
                                : "likes"}
                            </span>
                          )}{" "}
                          {activity.engagement.comments !== undefined && (
                            <span>
                              {activity.engagement.comments ?? 0}{" "}
                              {activity.engagement.comments === 1
                                ? "comment"
                                : "comments"}
                            </span>
                          )}
                          {activity.engagement.attendees && (
                            <span>
                              {activity.engagement.attendees} attendees
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )))}
            {feedHasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreFeed}
                >
                  Load more
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <BackToTop scrollContainerRef={scrollContainerRef} />
    </CommunityDashboard>
  );
}
