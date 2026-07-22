import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <FileQuestion className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight">
        Page not found
      </h1>

      <p className="mt-2 max-w-md text-muted-foreground">
        The page you are looking for does not exist or may have been moved.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/dashboard">
          <Button>
            Go to Dashboard
          </Button>
        </Link>

        <Link href="/">
          <Button variant="outline">
            Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}