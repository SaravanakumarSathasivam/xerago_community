"use client";

import { CommunityDashboard } from "@/components/dashboard/community-dashboard";
import { useRef, useEffect, useState } from "react";
import { BackToTop } from "@/components/ui/back-to-top";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AdminDashboard } from "@/components/admin/admin-dashboard"; // Import the new AdminDashboard

export default function AdminPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let storedUser = localStorage.getItem('xerago-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/");
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Please log in to access the admin page.",
      });
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "admin" && user.role !== "super_admin") {
    router.push("/");
    Swal.fire({
      icon: "error",
      title: "Access Denied",
      text: "You do not have administrative privileges to access this page.",
    });
    return null;
  }

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('xerago-user');
    router.push('/');
  };

  return (
    <CommunityDashboard user={user} onLogout={handleLogout}>
      <div ref={scrollContainerRef} className="relative h-[calc(100vh-theme(spacing.16))] overflow-y-auto pr-4">
        <AdminDashboard currentUser={user} />
        <BackToTop scrollContainerRef={scrollContainerRef} />
      </div>
    </CommunityDashboard>
  );
}
