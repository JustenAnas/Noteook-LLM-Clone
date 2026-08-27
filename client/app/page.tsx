import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-black">
      <main className="max-w-lg text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight">
          Notebook LLM
        </h1>
        <p className="mt-4 text-muted-foreground">
          Collect sources, organize workspaces, and chat with your knowledge base.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/app">Open app</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth">Sign in</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
