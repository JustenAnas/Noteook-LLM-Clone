
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MessageSquare,
  BookOpen,
  Settings,
  LogOut,
  Edit,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { signOut, useSession } from "@/lib/auth-client";
import EditWorkspaceModal from "@/components/edit-workspace-modal";
import ImportSourceModal from "@/components/import-source-modal";
import { ChatPanel } from "@/components/chat-panel";
import { NotebookGuide } from "@/components/notebook-guide";
import SourceStatusBadge from "@/components/source-status-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const { data: session, isPending: sessionLoading } = useSession();

  const { data: workspace, isLoading: workspaceLoading } =
    useWorkspace(workspaceId);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SourceType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] =
    useState<SourceStatus | "ALL">("ALL");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);

  const query = useMemo<ListSourcesQuery>(() => {
    const q: ListSourcesQuery = {};

    if (search.trim()) {
      q.q = search.trim();
    }

    if (typeFilter !== "ALL") {
      q.type = typeFilter;
    }

    if (statusFilter !== "ALL") {
      q.status = statusFilter;
    }

    return q;
  }, [search, typeFilter, statusFilter]);

  // Unfiltered sources are used to validate selections.
  // Filtering the visible list must not invalidate selected sources.
  const { data: allSources, isLoading: allSourcesLoading } =
    useSources(workspaceId, {});

  const hasFilters =
    search.trim().length > 0 ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL";

  const { data: filteredSources, isLoading: filteredSourcesLoading } =
    useSources(workspaceId, query);

  const sources = hasFilters ? filteredSources : allSources;

  const sourcesLoading = hasFilters
    ? filteredSourcesLoading
    : allSourcesLoading;

  const deleteSource = useDeleteSource(workspaceId);
  const bulkDelete = useBulkDeleteSources(workspaceId);

  const validSourceIds = useMemo(
    () => new Set((allSources ?? []).map((source) => source.id)),
    [allSources]
  );

  const readySourceIds = useMemo(
    () =>
      new Set(
        (allSources ?? [])
          .filter((source) => source.status === "READY")
          .map((source) => source.id)
      ),
    [allSources]
  );

  // Only READY sources from the current workspace can be used for RAG.
  const selectedForRag = useMemo(
    () =>
      new Set(
        [...selected].filter((id) => readySourceIds.has(id))
      ),
    [selected, readySourceIds]
  );

  const selectedForDeletion = useMemo(
    () =>
      new Set(
        [...selected].filter((id) => validSourceIds.has(id))
      ),
    [selected, validSourceIds]
  );

  const selectedCount = selectedForRag.size;

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.replace("/auth");
    }
  }, [session, sessionLoading, router]);

  // Reset selection and filters when switching workspaces.
  useEffect(() => {
    setSelected(new Set());
    setSearch("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
  }, [workspaceId]);

  function toggleSelect(id: string) {
    if (!readySourceIds.has(id)) {
      toast.error("Only READY sources can be selected for chat");
      return;
    }

    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function selectAllReady() {
    setSelected(new Set(readySourceIds));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  async function handleDeleteSource(sourceId: string) {
    if (!confirm("Delete this source permanently?")) {
      return;
    }

    try {
      await deleteSource.mutateAsync(sourceId);

      setSelected((previous) => {
        const next = new Set(previous);
        next.delete(sourceId);
        return next;
      });

      toast.success("Source deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Delete failed"
      );
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedForDeletion);

    if (ids.length === 0) {
      return;
    }

    if (
      !confirm(
        `Permanently delete ${ids.length} selected source(s)?`
      )
    ) {
      return;
    }

    try {
      await bulkDelete.mutateAsync(ids);

      setSelected(new Set());
      toast.success("Sources deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Bulk delete failed"
      );
    }
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
    <div
      key={workspaceId}
      className="flex h-screen w-full flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950"
    >
      {/* Top Navigation Bar */}
      <header className="relative z-10 flex h-14 w-full shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm dark:bg-black">
        <div className="flex items-center gap-4">
          <Link href="/app">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {workspace.icon ? (
              <span className="text-xl">{workspace.icon}</span>
            ) : null}

            <h1 className="font-heading text-lg font-semibold tracking-tight">
              {workspace.title}
            </h1>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Settings className="size-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Edit className="mr-2 size-4" />
              Edit Workspace
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={async () => {
                await signOut();
                router.replace("/auth");
              }}
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Main Layout */}
      <div className="flex w-full flex-1 flex-col overflow-hidden md:flex-row">
        {/* Sources Sidebar */}
        <aside className="flex w-full shrink-0 flex-col border-r border-border/50 bg-zinc-50/50 dark:bg-neutral-900/50 md:w-[320px] lg:w-[380px]">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sources
            </h2>

            <ImportSourceModal workspaceId={workspaceId} />
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Search and Filters */}
            <div className="mb-4 space-y-3">
              <Input
                placeholder="Search sources…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="bg-white shadow-sm dark:bg-black/50"
              />

              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={typeFilter}
                  onValueChange={(value) =>
                    setTypeFilter(value as SourceType | "ALL")
                  }
                >
                  <SelectTrigger className="h-8 bg-white text-xs shadow-sm dark:bg-black/50">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ALL">All types</SelectItem>

                    {SOURCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as SourceStatus | "ALL")
                  }
                >
                  <SelectTrigger className="h-8 bg-white text-xs shadow-sm dark:bg-black/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>

                    {SOURCE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source Selection Controls */}
            <div className="mb-4 rounded-xl border bg-card p-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium">
                  Chat Sources
                </span>

                <span className="text-xs text-muted-foreground">
                  {selectedCount} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={selectAllReady}
                  disabled={readySourceIds.size === 0}
                >
                  Select All
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={deselectAll}
                  disabled={selectedCount === 0}
                >
                  Deselect All
                </Button>
              </div>

              <p className="mt-2 text-[11px] text-muted-foreground">
                Select the sources your AI can use when answering.
                Only READY sources are available.
              </p>
            </div>

            {/* Bulk Delete */}
            {selectedForDeletion.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="mb-4 w-full shadow-sm"
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
              >
                <Trash2 className="mr-2 size-4" />
                Delete {selectedForDeletion.size} selected
              </Button>
            )}

            {/* Source List */}
            {sourcesLoading || allSourcesLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : !sources?.length ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-white/40 p-8 text-center dark:bg-black/20">
                <p className="text-sm font-medium text-foreground/80">
                  {hasFilters
                    ? "No matching sources"
                    : "No sources yet"}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {hasFilters
                    ? "Try changing your search or filters."
                    : "Upload a PDF, link a website, or paste text to get started."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sources.map((source) => {
                  const isReady = source.status === "READY";
                  const isSelected = selectedForRag.has(source.id);

                  return (
                    <div
                      key={source.id}
                      className="group relative flex flex-col gap-2 rounded-xl border bg-card p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-primary/0 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative z-10 flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          disabled={!isReady}
                          onCheckedChange={() =>
                            toggleSelect(source.id)
                          }
                          className="mt-1 shadow-none"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-2 text-sm font-medium leading-snug">
                            {source.title}
                          </h4>

                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {source.type}
                            </span>

                            <SourceStatusBadge
                              status={source.status}
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                          title="Delete source"
                          disabled={deleteSource.isPending}
                          onClick={() =>
                            handleDeleteSource(source.id)
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>

                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 mt-1 line-clamp-1 px-7 text-[11px] text-primary/80 hover:text-primary hover:underline"
                        >
                          {source.url}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Chat and Notebook Guide */}
        <main className="flex min-w-0 flex-1 flex-col bg-white dark:bg-neutral-950">
          <Tabs
            key={workspaceId}
            defaultValue="chat"
            className="flex h-full flex-col"
          >
            <div className="flex h-14 shrink-0 items-center justify-center border-b border-border/50 bg-zinc-50/30 px-4 dark:bg-black/20">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2 rounded-full bg-muted/60 p-1">
                <TabsTrigger
                  value="chat"
                  className="flex items-center gap-2 rounded-full text-xs transition-all data-[state=active]:shadow-sm"
                >
                  <MessageSquare className="size-3.5" />
                  Chat
                </TabsTrigger>

                <TabsTrigger
                  value="guide"
                  className="flex items-center gap-2 rounded-full text-xs transition-all data-[state=active]:shadow-sm"
                >
                  <BookOpen className="size-3.5" />
                  Notebook Guide
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="chat"
              className="relative m-0 flex-1 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col"
            >
              <ChatPanel
                key={workspaceId}
                workspaceId={workspaceId}
                selected={selectedForRag}
              />
            </TabsContent>

            <TabsContent
              value="guide"
              className="m-0 flex-1 overflow-y-auto p-10 custom-scrollbar"
            >
              <NotebookGuide
                key={workspaceId}
                selected={selectedForRag}
                workspaceId={workspaceId}
              />
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
