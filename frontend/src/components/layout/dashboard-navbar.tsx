"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, LayoutDashboard, FileText, Mic, Settings, ShieldCheck } from "lucide-react";
import { Logo, ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/utils/cn";
import { cn } from "@/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/interview", label: "Interview", icon: Mic },
  { href: "/settings", label: "Settings", icon: Settings, disabled: true },
];

export function DashboardNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const menuItems = [
    ...navItems,
    ...(user?.role === "ADMIN"
      ? [{ href: "/admin", label: "Admin Panel", icon: ShieldCheck }]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out", description: "See you next time!" });
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass-strong">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo href="/dashboard" />
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary/50",
                  item.disabled && "opacity-50 pointer-events-none"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-white">
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div className="text-sm">
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
