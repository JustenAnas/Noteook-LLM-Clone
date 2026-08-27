"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MessageSquare, BookOpen, Settings } from "lucide-react";
import EditWorkspaceModal from "@/components/edit-workspace-modal";
import ImportSourceModal from "@/components/import-source-modal";
import { ChatPanel } from "@/components/chat-panel";
import { NotebookGuide } from "@/components/notebook-guide";
import SourceStatusBadge from "@/components/source-status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { SOURCE_STATUSES, SOURCE_TYPES } from "@/lib/config";
import type { SourceStatus, SourceType } from "@/lib/config";
import type { ListSourcesQuery } from "@/lib/types";
import {
  useBulkDeleteSources,
  useDeleteSource,
  useSources,
  useWorkspace,
} from "@/lib/hooks/use-workspaces";
import { toast } from "sonner";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params?.workspaceId as string;
  const isMobile = useIsMobile();

  const { data: session, isPending: sessionLoading } = useSession();
  const { data: workspace, isLoading: workspaceLoading } =
    useWorkspace(workspaceId);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SourceType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<SourceStatus | "ALL">("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);

  const query = useMemo<ListSourcesQuery>(() => {
    const q: ListSourcesQuery = {};
    if (search.trim()) q.q = search.trim();
    if (typeFilter !== "ALL") q.type = typeFilter;
    if (statusFilter !== "ALL") q.status = statusFilter;
    return q;
  }, [search, typeFilter, statusFilter]);

  const { data: sources, isLoading: sourcesLoading } =
    useSources(workspaceId, query);
  const deleteSource = useDeleteSource(workspaceId);
  const bulkDelete = useBulkDeleteSources(workspaceId);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.replace("/auth");
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(new Set());
  }, [sources]);

  async function handleDeleteSource(sourceId: string) {
    if (!confirm("Delete this source?")) return;
    try {
      await deleteSource.mutateAsync(sourceId);
      toast.success("Source deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function handleBulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected source(s)?`)) return;
    try {
      await bulkDelete.mutateAsync(Array.from(selected));
      toast.success("Sources deleted");
      setSelected(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk delete failed");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (sessionLoading || workspaceLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Spinner />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-8">
        <p>Workspace not found.</p>
        <Link href="/app" className="text-primary underline">
          Back to workspaces
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Top Navigation Bar */}
      <header className="flex h-14 shrink-0 w-full items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-black z-10 relative">
        <div className="flex items-center gap-4">
          <Link href="/app">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ChevronLeft className="size-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {workspace.icon ? <span className="text-xl">{workspace.icon}</span> : null}
            <h1 className="font-heading text-lg font-semibold tracking-tight">{workspace.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setEditOpen(true)}>
            <Settings className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      {/* Main Dual Pane Layout */}
      <div className="flex flex-1 w-full overflow-hidden flex-col md:flex-row">
        
        {/* Left Pane: Sources */}
        <aside className="w-full md:w-[320px] lg:w-[380px] shrink-0 flex flex-col bg-zinc-50/50 dark:bg-neutral-900/50 border-r border-border/50">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4">
            <h2 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Sources</h2>
            <ImportSourceModal workspaceId={workspaceId} />
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="mb-6 space-y-3">
              <Input
                placeholder="Search sources…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white shadow-sm dark:bg-black/50"
              />
              <div className="grid grid-cols-2 gap-2">
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as SourceType | "ALL")}>
                  <SelectTrigger className="bg-white shadow-sm text-xs dark:bg-black/50 h-8">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All types</SelectItem>
                    {SOURCE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SourceStatus | "ALL")}>
                  <SelectTrigger className="bg-white shadow-sm text-xs dark:bg-black/50 h-8">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    {SOURCE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selected.size > 0 && (
              <Button variant="destructive" size="sm" className="mb-4 w-full shadow-sm" onClick={handleBulkDelete} disabled={bulkDelete.isPending}>
                Delete {selected.size} selected
              </Button>
            )}

            {sourcesLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : !sources?.length ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-8 text-center bg-white/40 dark:bg-black/20">
                <p className="text-sm font-medium text-foreground/80">No sources yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Upload a PDF, link a website, or paste text to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sources.map((s) => (
                  <div key={s.id} className="group relative flex flex-col gap-2 rounded-xl border bg-card p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/0 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl" />
                    
                    <div className="flex items-start gap-3 relative z-10">
                      <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleSelect(s.id)} className="mt-1 shadow-none" />
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-sm font-medium leading-snug">{s.title}</h4>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-muted-foreground">{s.type}</span>
                          <SourceStatusBadge status={s.status} />
                        </div>
                      </div>
                    </div>
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noreferrer" className="text-[11px] text-primary/80 hover:text-primary hover:underline px-7 line-clamp-1 mt-1 relative z-10">
                        {s.url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Right Pane: Chat & Notebook Guide */}
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-950">
          <Tabs defaultValue="chat" className="flex h-full flex-col">
            <div className="flex h-14 shrink-0 items-center justify-center border-b border-border/50 px-4 bg-zinc-50/30 dark:bg-black/20">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2 rounded-full p-1 bg-muted/60">
                <TabsTrigger value="chat" className="rounded-full flex items-center gap-2 text-xs transition-all data-[state=active]:shadow-sm">
                  <MessageSquare className="size-3.5" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="guide" className="rounded-full flex items-center gap-2 text-xs transition-all data-[state=active]:shadow-sm">
                  <BookOpen className="size-3.5" />
                  Notebook Guide
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="m-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col relative">
              <ChatPanel workspaceId={workspaceId} selected={selected} />
            </TabsContent>

            <TabsContent value="guide" className="m-0 flex-1 overflow-y-auto p-10 custom-scrollbar">
              <NotebookGuide selected={selected} workspaceId={workspaceId} />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <EditWorkspaceModal
        workspace={workspace}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </div>
  );
}
