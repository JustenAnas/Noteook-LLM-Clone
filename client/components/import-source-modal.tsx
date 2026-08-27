"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  workspaceId: string;
  onCreated?: () => void;
};

type ImportTab = "pdf" | "website" | "youtube" | "text" | "markdown";

export default function ImportSourceModal({ workspaceId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<ImportTab>("pdf");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  function reset() {
    setTitle("");
    setUrl("");
    setContent("");
    setFile(null);
    setTab("pdf");
  }

  async function submit() {
    setLoading(true);
    try {
      switch (tab) {
        case "pdf": {
          if (!file) throw new Error("Select a PDF file");
          await api.sources.uploadPdf(
            workspaceId,
            file,
            title.trim() || undefined,
          );
          break;
        }
        case "website": {
          if (!url.trim()) throw new Error("URL is required");
          await api.sources.importWebsite(workspaceId, {
            url: url.trim(),
            title: title.trim() || undefined,
          });
          break;
        }
        case "youtube": {
          if (!url.trim()) throw new Error("YouTube URL is required");
          await api.sources.importYoutube(workspaceId, {
            url: url.trim(),
            title: title.trim() || undefined,
          });
          break;
        }
        case "text": {
          if (!title.trim() || !content.trim()) {
            throw new Error("Title and content are required");
          }
          await api.sources.create(workspaceId, {
            type: "TEXT",
            title: title.trim(),
            content: content.trim(),
          });
          break;
        }
        case "markdown": {
          if (!title.trim() || !content.trim()) {
            throw new Error("Title and content are required");
          }
          await api.sources.create(workspaceId, {
            type: "MARKDOWN",
            title: title.trim(),
            content: content.trim(),
          });
          break;
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ["sources", workspaceId],
      });
      toast.success("Source imported");
      setOpen(false);
      reset();
      onCreated?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">Import source</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import source</DialogTitle>
          <DialogDescription>
            Add PDFs, websites, YouTube videos, or pasted text to this workspace.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ImportTab)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pdf">PDF</TabsTrigger>
            <TabsTrigger value="website">Web</TabsTrigger>
            <TabsTrigger value="youtube">YouTube</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="markdown">MD</TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="grid gap-3 pt-2">
            <label className="text-sm font-medium">PDF file</label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <label className="text-sm font-medium">Title (optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Defaults to filename"
            />
          </TabsContent>

          <TabsContent value="website" className="grid gap-3 pt-2">
            <label className="text-sm font-medium">URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
            />
            <label className="text-sm font-medium">Title (optional)</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </TabsContent>

          <TabsContent value="youtube" className="grid gap-3 pt-2">
            <label className="text-sm font-medium">YouTube URL</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <label className="text-sm font-medium">Title (optional)</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </TabsContent>

          <TabsContent value="text" className="grid gap-3 pt-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </TabsContent>

          <TabsContent value="markdown" className="grid gap-3 pt-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className="text-sm font-medium">Markdown content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
