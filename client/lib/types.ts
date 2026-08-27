import type { ChatModel, SourceStatus, SourceType } from "./config";

export type Workspace = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  defaultModel: ChatModel;
  createdAt: string;
  updatedAt: string;
};

export type Source = {
  id: string;
  workspaceId: string;
  type: SourceType;
  title: string;
  content: string | null;
  url: string | null;
  status: SourceStatus;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
};

export type ApiError = {
  error: string;
  details?: Record<string, string[]>;
};

export type CreateWorkspaceInput = {
  title: string;
  description?: string;
  icon?: string;
  defaultModel?: ChatModel;
};

export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput>;

export type CreateTextSourceInput = {
  type: "TEXT";
  title: string;
  content: string;
};

export type CreateMarkdownSourceInput = {
  type: "MARKDOWN";
  title: string;
  content: string;
};

export type CreateSourceInput =
  | CreateTextSourceInput
  | CreateMarkdownSourceInput;

export type ImportWebsiteInput = {
  url: string;
  title?: string;
};

export type ImportYoutubeInput = {
  url: string;
  title?: string;
};

export type ListSourcesQuery = {
  q?: string;
  type?: SourceType;
  status?: SourceStatus;
};
