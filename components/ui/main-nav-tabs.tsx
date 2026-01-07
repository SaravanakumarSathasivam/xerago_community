"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Trophy,
  BookOpen,
  TrendingUp,
  Calendar,
  Settings,
} from "lucide-react";
import { IUser } from "@/models/user";

interface MainNavTabsProps {
  isAdmin: boolean;
}

export function MainNavTabs({ isAdmin }: MainNavTabsProps) {
  const pathname = usePathname();

  return (
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
  );
}

