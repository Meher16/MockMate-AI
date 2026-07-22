"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/use-auth";
import { ToastContextProvider } from "@/hooks/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ToastContextProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastContextProvider>
    </ThemeProvider>
  );
}
