"use client";

import { useState } from "react";
import { Search, Trash2, Calendar, FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminService, type AdminUser } from "@/services/admin.service";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/axios";

interface AdminUsersProps {
  users: AdminUser[];
  currentAdminId: string;
  onRefresh: () => void;
}

export function AdminUsers({ users, currentAdminId, onRefresh }: AdminUsersProps) {
  const [search, setSearch] = useState("");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (userId: string, email: string) => {
    if (userId === currentAdminId) {
      toast({
        title: "Forbidden",
        description: "You cannot delete your own admin account.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user ${email}? This will delete all their resumes, interviews, and feedback. This action is permanent.`)) {
      return;
    }

    setIsDeletingId(userId);
    try {
      await adminService.deleteUser(userId);
      toast({
        title: "Success",
        description: `User ${email} has been deleted.`,
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Failed to delete user",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card className="glass-strong">
            <CardContent className="py-12 text-center text-muted-foreground">
              No users found matching your search.
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((u) => {
            const isSelf = u.id === currentAdminId;
            return (
              <Card key={u.id} className="glass hover:bg-card/50 transition-colors duration-150">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg">{u.firstName} {u.lastName}</h4>
                      {u.role === "ADMIN" && <Badge variant="gradient">Admin</Badge>}
                      {isSelf && <Badge variant="secondary">You</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Registered: {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Resumes: {u._count.resumes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" /> Interviews: {u._count.interviews}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={isDeletingId === u.id}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
