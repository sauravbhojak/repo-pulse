import Link from "next/link";
import { Activity } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-xl">
          <Activity className="w-6 h-6 text-primary" />
          <span>RepoPulse</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/compare" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Compare
          </Link>
          <Link href="/admin" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Admin
          </Link>
          <Link href="/" className={cn(buttonVariants({ size: "sm" }), "hidden md:inline-flex rounded-full")}>
            Analyze Repo
          </Link>
        </nav>
      </div>
    </header>
  );
}
