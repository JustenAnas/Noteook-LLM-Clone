"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowUp, Paperclip, Bot, User } from "lucide-react";
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
import { Message, MessageGroup, MessageAvatar } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";

export function ChatPanel({ workspaceId, selected }: { workspaceId: string; selected: Set<string> }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/workspaces/${workspaceId}/chat`,
      body: {
        sourceIds: Array.from(selected),
      },
    }),
    onError: (err) => {
        console.error("Chat error:", err);
    }
  });

  const isLoading = status === "submitted" || status === "streaming";
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sendMessage({ role: "user", content: input });
    setInput("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
          formRef.current?.requestSubmit();
      }
    }
  };

  const viewportRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when streaming new content
  useEffect(() => {
    if (status === "streaming" && viewportRef.current) {
        const viewport = viewportRef.current;
        // Check if we are near the bottom (within 150px)
        const isNearBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 150;
        
        if (isNearBottom) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        }
    }
  }, [messages, status]);

  return (
    <div className="flex h-full w-full flex-col min-w-0 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <MessageScrollerProvider>
          <MessageScroller className="px-4 py-6 md:px-8">
            <MessageScrollerViewport ref={viewportRef}>
              <MessageScrollerContent>
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-muted-foreground mt-20">
                        Chat with your selected sources!
                    </div>
                )}
                {messages.map((msg, index) => {
                  const content = msg.content || (msg.parts ? msg.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('') : "");
                  const isLast = index === messages.length - 1;
                  return (
                  <MessageScrollerItem key={msg.id} className="w-full" scrollAnchor={isLast && status !== "submitted"}>
                    <MessageGroup>
                      <Message align={msg.role === "user" ? "end" : "start"}>
                        <MessageAvatar className="size-8 mt-auto shrink-0 shadow-sm border border-border/50">
                          {msg.role === "assistant" || msg.role === "system" ? <Bot className="size-5 text-primary" /> : <User className="size-5 text-muted-foreground" />}
                        </MessageAvatar>
                        <Bubble variant={msg.role === "user" ? "default" : "secondary"}>
                          <BubbleContent className="text-[15px] leading-relaxed shadow-sm">
                            {content}
                          </BubbleContent>
                        </Bubble>
                      </Message>
                    </MessageGroup>
                  </MessageScrollerItem>
                )})}
                {status === "submitted" && (
                  <MessageScrollerItem className="w-full" scrollAnchor>
                    <MessageGroup>
                      <Message align="start">
                        <MessageAvatar className="size-8 mt-auto shrink-0 shadow-sm border border-border/50">
                          <Bot className="size-5 text-primary" />
                        </MessageAvatar>
                        <Bubble variant="secondary">
                          <BubbleContent className="text-[15px] leading-relaxed shadow-sm flex items-center h-[44px]">
                            <span className="flex gap-1.5 items-center justify-center">
                              <span className="size-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="size-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="size-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
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
          <form ref={formRef} onSubmit={handleSubmit} className="relative flex w-full flex-col rounded-2xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-primary/20 transition-shadow">
            <Textarea
              placeholder="Chat with your sources..."
              className="min-h-[60px] max-h-[200px] w-full resize-none border-0 bg-transparent px-4 py-4 text-base shadow-none focus-visible:ring-0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="flex items-center justify-between px-3 py-2 border-t border-border/30">
              <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full hover:bg-muted" type="button" title="Attach file">
                <Paperclip className="size-4" />
              </Button>
              <Button 
                type="submit"
                disabled={!input.trim() || isLoading} 
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
