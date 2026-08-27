"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CreateWorkspaceInput,
  ListSourcesQuery,
  UpdateWorkspaceInput,
} from "@/lib/types";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => api.workspaces.list(),
  });
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId],
    queryFn: () => api.workspaces.get(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkspaceInput) => api.workspaces.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateWorkspaceInput) =>
      api.workspaces.update(workspaceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workspaceId: string) => api.workspaces.delete(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useSources(workspaceId: string, query?: ListSourcesQuery) {
  return useQuery({
    queryKey: ["sources", workspaceId, query],
    queryFn: () => api.sources.list(workspaceId, query),
    enabled: Boolean(workspaceId),
    refetchInterval: (q) => {
      const sources = q.state.data;
      if (!sources) return false;
      const hasPending = sources.some(
        (s) => s.status === "PENDING" || s.status === "PROCESSING",
      );
      return hasPending ? 3000 : false;
    },
  });
}

export function useDeleteSource(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) =>
      api.sources.delete(workspaceId, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", workspaceId] });
    },
  });
}

export function useBulkDeleteSources(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceIds: string[]) =>
      api.sources.bulkDelete(workspaceId, sourceIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources", workspaceId] });
    },
  });
}
