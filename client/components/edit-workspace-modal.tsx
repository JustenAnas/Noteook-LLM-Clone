"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useUpdateWorkspace } from "@/lib/hooks/use-workspaces";
import { toast } from "sonner";

type Props = {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditWorkspaceModal({
  workspace,
  open,
  onOpenChange,
}: Props) {
  const [title, setTitle] = useState(workspace.title);
  const [description, setDescription] = useState(workspace.description ?? "");
  const [icon, setIcon] = useState(workspace.icon ?? "");
  const [defaultModel, setDefaultModel] = useState(workspace.defaultModel);

  const updateWorkspace = useUpdateWorkspace(workspace.id);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(workspace.title);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDescription(workspace.description ?? "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIcon(workspace.icon ?? "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDefaultModel(workspace.defaultModel);
    }
  }, [open, workspace]);

  async function save() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      await updateWorkspace.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        defaultModel,
      });
      toast.success("Workspace updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit workspace</DialogTitle>
          <DialogDescription>
            Update your workspace name, icon, and default chat model.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <label className="text-sm font-medium">Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />

          <label className="text-sm font-medium">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
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
            onValueChange={(v) => setDefaultModel(v as typeof defaultModel)}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={updateWorkspace.isPending}>
            {updateWorkspace.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
