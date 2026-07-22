import { RegisterForm } from "@/features/auth/register-form";
import { Logo, ThemeToggle } from "@/components/layout/theme-toggle";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 glass-strong">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <RegisterForm />
      </main>
    </div>
  );
}
