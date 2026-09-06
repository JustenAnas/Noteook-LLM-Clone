"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import AppHeader from "@/components/app-header";
import CreateWorkspaceModal from "@/components/create-workspace-modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";
import { useDeleteWorkspace, useWorkspaces } from "@/lib/hooks/use-workspaces";
import { toast } from "sonner";

export default function AppPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: workspaces, isLoading: workspacesLoading } = useWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.replace("/auth");
    }
  }, [session, sessionLoading, router]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete workspace "${title}"? This cannot be undone.`)) return;
    try {
      await deleteWorkspace.mutateAsync(id);
      toast.success("Workspace deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }
  console.log("SESSION:", session);
console.log("SESSION LOADING:", sessionLoading);
console.log("WORKSPACES:", workspaces);
console.log("WORKSPACES LOADING:", workspacesLoading);
  if (sessionLoading || workspacesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <AppHeader />

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-4">
        <aside className="rounded-lg border bg-background p-4 shadow-sm lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium">Workspaces</h3>
            <CreateWorkspaceModal />
          </div>

          <div className="space-y-2">
            {!workspaces?.length ? (
              <p className="text-sm text-muted-foreground">
                No workspaces yet. Create one to get started.
              </p>
            ) : null}
            {workspaces?.map((w) => (
              <div
                key={w.id}
                className="group flex items-start justify-between rounded-md border p-2 hover:bg-muted/50"
              >
                <Link href={`/app/workspaces/${w.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {w.icon ? <span>{w.icon}</span> : null}
                    <div className="font-medium">{w.title}</div>
                  </div>
                  {w.description ? (
                    <div className="truncate text-xs text-muted-foreground">
                      {w.description}
                    </div>
                  ) : null}
                  <div className="mt-1 text-xs text-muted-foreground">
                    Model: {w.defaultModel}
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(w.id, w.title)}
                  disabled={deleteWorkspace.isPending}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border bg-background p-6 shadow-sm lg:col-span-3">
          <h3 className="text-lg font-semibold">Welcome back</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Create a workspace, import PDFs, websites, or YouTube videos as
            sources, and build your knowledge base. Select a workspace from the
            sidebar to manage sources.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border p-4">
              <h4 className="font-medium">Workspaces</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Organize research by topic with custom icons and chat models.
              </p>
            </div>
            <div className="rounded-md border p-4">
              <h4 className="font-medium">Sources</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Import PDF, website, YouTube, text, or markdown content.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
