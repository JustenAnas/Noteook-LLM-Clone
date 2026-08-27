"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHAT_MODELS } from "@/lib/config";
import type { Workspace } from "@/lib/types";
import { useCreateWorkspace } from "@/lib/hooks/use-workspaces";
import { toast } from "sonner";

type Props = {
  onCreated?: (ws: Workspace) => void;
};

export default function CreateWorkspaceModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [defaultModel, setDefaultModel] =
    useState<(typeof CHAT_MODELS)[number]>("gpt-4o-mini");

  const createWorkspace = useCreateWorkspace();

  async function create() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const ws = await createWorkspace.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        defaultModel,
      });
      setOpen(false);
      setTitle("");
      setDescription("");
      setIcon("");
      setDefaultModel("gpt-4o-mini");
      onCreated?.(ws);
      toast.success("Workspace created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create workspace");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">New workspace</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Workspaces group your sources and knowledge for chat.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Research Notes"
          />

          <label className="text-sm font-medium">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />

          <label className="text-sm font-medium">Icon</label>
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="📓"
            maxLength={8}
          />

          <label className="text-sm font-medium">Default model</label>
          <Select
            value={defaultModel}
            onValueChange={(v) =>
              setDefaultModel(v as (typeof CHAT_MODELS)[number])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHAT_MODELS.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={create} disabled={createWorkspace.isPending}>
            {createWorkspace.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
