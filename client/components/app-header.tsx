"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function AppHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  async function handleSignOut() {
    await signOut();
    router.replace("/auth");
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/app" className="font-heading text-xl font-semibold tracking-tight">
          Notebook LLM
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.name || user.email}
            </span>
          ) : null}
          <ModeToggle />
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
