import type {
  ApiError,
  CreateSourceInput,
  CreateWorkspaceInput,
  ImportWebsiteInput,
  ImportYoutubeInput,
  ListSourcesQuery,
  Source,
  UpdateWorkspaceInput,
  Workspace,
} from "./types";

class ApiRequestError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

async function parseError(res: Response): Promise<ApiRequestError> {
  const payload = (await res.json().catch(() => ({}))) as ApiError;
  return new ApiRequestError(
    payload.error ?? `Request failed (${res.status})`,
    res.status,
    payload.details,
  );
}

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers = new Headers(init?.headers);

  let body = init?.body;
  if (init?.json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(init.json);
  }

  const res = await fetch(path, {
    ...init,
    headers,
    body,
    credentials: "include",
  });

  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function buildQuery(params?: ListSourcesQuery): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.type) search.set("type", params.type);
  if (params.status) search.set("status", params.status);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  workspaces: {
    list: () => request<Workspace[]>("/api/workspaces"),

    get: (workspaceId: string) =>
      request<Workspace>(`/api/workspaces/${workspaceId}`),

    create: (input: CreateWorkspaceInput) =>
      request<Workspace>("/api/workspaces", {
        method: "POST",
        json: input,
      }),

    update: (workspaceId: string, input: UpdateWorkspaceInput) =>
      request<Workspace>(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        json: input,
      }),

    delete: (workspaceId: string) =>
      request<void>(`/api/workspaces/${workspaceId}`, { method: "DELETE" }),
  },

  sources: {
    list: (workspaceId: string, query?: ListSourcesQuery) =>
      request<Source[]>(
        `/api/workspaces/${workspaceId}/sources${buildQuery(query)}`,
      ),

    get: (workspaceId: string, sourceId: string) =>
      request<Source>(`/api/workspaces/${workspaceId}/sources/${sourceId}`),

    create: (workspaceId: string, input: CreateSourceInput) =>
      request<Source>(`/api/workspaces/${workspaceId}/sources`, {
        method: "POST",
        json: input,
      }),

    uploadPdf: async (
      workspaceId: string,
      file: File,
      title?: string,
    ): Promise<Source> => {
      const form = new FormData();
      form.append("file", file);
      if (title) form.append("title", title);

      const res = await fetch(
        `/api/workspaces/${workspaceId}/sources/upload`,
        {
          method: "POST",
          body: form,
          credentials: "include",
        },
      );

      if (!res.ok) throw await parseError(res);
      return res.json();
    },

    importWebsite: (workspaceId: string, input: ImportWebsiteInput) =>
      request<Source>(
        `/api/workspaces/${workspaceId}/sources/import/website`,
        { method: "POST", json: input },
      ),

    importYoutube: (workspaceId: string, input: ImportYoutubeInput) =>
      request<Source>(
        `/api/workspaces/${workspaceId}/sources/import/youtube`,
        { method: "POST", json: input },
      ),

    delete: (workspaceId: string, sourceId: string) =>
      request<void>(`/api/workspaces/${workspaceId}/sources/${sourceId}`, {
        method: "DELETE",
      }),

    bulkDelete: (workspaceId: string, sourceIds: string[]) =>
      request<void>(`/api/workspaces/${workspaceId}/sources/bulk-delete`, {
        method: "POST",
        json: { sourceIds },
      }),
  },
};

export { ApiRequestError };
