"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { PageTransition } from "@/components/ui/motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { adminService, type AdminStats, type AdminUser, type AdminInterview } from "@/services/admin.service";
import { AdminOverview } from "@/features/admin/admin-overview";
import { AdminUsers } from "@/features/admin/admin-users";
import { AdminInterviews } from "@/features/admin/admin-interviews";
import { getErrorMessage } from "@/lib/axios";

type AdminTab = "overview" | "users" | "interviews";

export default function AdminDashboardPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [interviews, setInterviews] = useState<AdminInterview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, usersData, interviewsData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getInterviews(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setInterviews(interviewsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="min-h-screen">
        <DashboardNavbar />
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <PageTransition className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Manage users, review interview history, and monitor platform metrics.
                </p>
              </div>
              <Button onClick={fetchData} disabled={isLoading} variant="outline">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh Data
              </Button>
            </div>

            {/* Tab Selection */}
            <div className="flex border-b border-border/50 gap-4">
              {(["overview", "users", "interviews"] as AdminTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold capitalize border-b-2 transition-all duration-200 ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            {isLoading && !stats ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading admin data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-md mx-auto">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                  <h3 className="font-semibold text-lg">Failed to load admin panel</h3>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
                <Button onClick={fetchData}>Try Again</Button>
              </div>
            ) : (
              <div>
                {activeTab === "overview" && stats && (
                  <AdminOverview stats={stats} onViewTab={(tab) => setActiveTab(tab)} />
                )}
                {activeTab === "users" && (
                  <AdminUsers
                    users={users}
                    currentAdminId={currentUser?.id ?? ""}
                    onRefresh={fetchData}
                  />
                )}
                {activeTab === "interviews" && (
                  <AdminInterviews interviews={interviews} />
                )}
              </div>
            )}
          </PageTransition>
        </main>
      </div>
    </ProtectedRoute>
  );
}
