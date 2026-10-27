
"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowUp, Paperclip, Bot, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerViewport,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";
import {
  Message,
  MessageGroup,
  MessageAvatar,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

export function ChatPanel({
  workspaceId,
  selected,
}: {
  workspaceId: string;
  selected: Set<string>;
}) {
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const selectedSourceIds = Array.from(selected);
  const selectedCount = selectedSourceIds.length;

  const { messages, sendMessage, status } = useChat({
    id: `workspace-chat-${workspaceId}`,
    transport: new DefaultChatTransport({
      api: `/api/workspaces/${workspaceId}/chat`,
    }),
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const isLoading =
    status === "submitted" || status === "streaming";

  const canSend =
    input.trim().length > 0 &&
    selectedCount > 0 &&
    !isLoading;

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    if (!canSend) return;

    sendMessage(
      { text: input.trim() },
      {
        body: {
          sourceIds: Array.from(selected),
        },
      }
    );

    setInput("");
  };

  const onKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (canSend) {
        formRef.current?.requestSubmit();
      }
    }
  };

  useEffect(() => {
    setInput("");
  }, [workspaceId]);

  useEffect(() => {
    if (status !== "streaming" || !viewportRef.current) {
      return;
    }

    const viewport = viewportRef.current;

    const distanceFromBottom =
      viewport.scrollHeight -
      viewport.scrollTop -
      viewport.clientHeight;

    if (distanceFromBottom < 150) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, status]);

  return (
    <div className="relative flex h-full w-full min-w-0 flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageScrollerProvider>
          <MessageScroller className="px-4 py-6 md:px-8">
            <MessageScrollerViewport ref={viewportRef}>
              <MessageScrollerContent>
                {messages.length === 0 && (
                  <div className="mt-20 flex h-full items-center justify-center text-muted-foreground">
                    Chat with your selected sources!
                  </div>
                )}

                {messages.map((msg, index) => {
                  const content = msg.parts
                    .filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join("");

                  const isLast = index === messages.length - 1;

                  return (
                    <MessageScrollerItem
                      key={msg.id}
                      className="w-full"
                      scrollAnchor={
                        isLast && status !== "submitted"
                      }
                    >
                      <MessageGroup>
                        <Message
                          align={
                            msg.role === "user"
                              ? "end"
                              : "start"
                          }
                        >
                          <MessageAvatar className="mt-auto size-8 shrink-0 border border-border/50 shadow-sm">
                            {msg.role === "assistant" ||
                            msg.role === "system" ? (
                              <Bot className="size-5 text-primary" />
                            ) : (
                              <User className="size-5 text-muted-foreground" />
                            )}
                          </MessageAvatar>

                          <Bubble
                            variant={
                              msg.role === "user"
                                ? "default"
                                : "secondary"
                            }
                          >
                            <BubbleContent className="text-[15px] leading-relaxed shadow-sm">
                              {content}
                            </BubbleContent>
                          </Bubble>
                        </Message>
                      </MessageGroup>
                    </MessageScrollerItem>
                  );
                })}

                {status === "submitted" && (
                  <MessageScrollerItem
                    className="w-full"
                    scrollAnchor
                  >
                    <MessageGroup>
                      <Message align="start">
                        <MessageAvatar className="mt-auto size-8 shrink-0 border border-border/50 shadow-sm">
                          <Bot className="size-5 text-primary" />
                        </MessageAvatar>

                        <Bubble variant="secondary">
                          <BubbleContent className="flex h-[44px] items-center text-[15px] leading-relaxed shadow-sm">
                            <span className="flex items-center justify-center gap-1.5">
                              <span className="size-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.3s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.15s]" />
                              <span className="size-1.5 animate-bounce rounded-full bg-foreground/40" />
                            </span>
                          </BubbleContent>
                        </Bubble>
                      </Message>
                    </MessageGroup>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>

            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-4 pt-0">
        <div className="mx-auto max-w-3xl">
          {/* Selected Sources Indicator */}
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="size-4" />

            <span>
              {selectedCount === 0
                ? "No sources selected"
                : `${selectedCount} source${
                    selectedCount === 1 ? "" : "s"
                  } selected`}
            </span>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="relative flex w-full flex-col rounded-2xl border bg-background shadow-sm transition-shadow focus-within:ring-1 focus-within:ring-primary/20"
          >
            <Textarea
              placeholder={
                selectedCount === 0
                  ? "Select at least one source to start chatting..."
                  : "Chat with your sources..."
              }
              className="min-h-[60px] max-h-[200px] w-full resize-none border-0 bg-transparent px-4 py-4 text-base shadow-none focus-visible:ring-0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />

            <div className="flex items-center justify-between border-t border-border/30 px-3 py-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-muted-foreground hover:bg-muted"
                type="button"
                title="Attach file"
              >
                <Paperclip className="size-4" />
              </Button>

              <Button
                type="submit"
                disabled={!canSend}
                size="icon"
                className="rounded-full shadow-sm"
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </form>

          <div className="mt-2 text-center text-[10px] text-muted-foreground/60">
            AI can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  );
}
