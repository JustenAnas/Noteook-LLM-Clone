"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, Send, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type WorkspaceChatProps = {
  workspaceId: string;
  model: string;
};

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: crypto.randomUUID(), role, content };
}

export default function WorkspaceChat({ workspaceId, model }: WorkspaceChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessage = createMessage("user", content);
    const nextMessages = [...messages, nextMessage];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        credentials: "include",
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: text }) => ({
            id: crypto.randomUUID(),
            role,
            parts: [{ type: "text", text }],
          })),
          model,
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Chat request failed (${response.status})`);
      }

      throw new Error("The chat stream is not connected to the client yet.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send message");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-white via-white to-muted/20 dark:from-neutral-950 dark:via-neutral-950 dark:to-black">
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex min-h-[min(48vh,30rem)] flex-col items-center justify-center text-center">
              <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary">
                <Sparkles className="size-8" />
              </div>
              <h3 className="font-heading text-3xl font-bold tracking-tight">Ask your sources</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                Ask a focused question and use your workspace sources as the starting point for the answer.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" ? <Sparkles className="mt-1 size-4 shrink-0 text-primary" /> : null}
                <div className={`max-w-[min(90%,42rem)] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-primary text-primary-foreground" : "border bg-card"}`}>
                  {message.content}
                </div>
                {message.role === "user" ? <UserRound className="mt-1 size-4 shrink-0 text-muted-foreground" /> : null}
              </div>
            ))
          )}
          {isSending ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" /> Preparing an answer...
            </div>
          ) : null}
          {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">{error}</p> : null}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t bg-white/80 p-4 backdrop-blur dark:bg-black/40 sm:p-6">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a question about your sources..."
            aria-label="Message"
            disabled={isSending}
            className="h-10 flex-1 border-0 bg-transparent px-3 shadow-none focus-visible:ring-0"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isSending} className="size-10 shrink-0 rounded-xl" aria-label="Send message">
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}