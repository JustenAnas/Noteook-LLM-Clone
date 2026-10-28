
import { useState } from "react";
import { BookOpen, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

const TOOLS = [
  "Summary",
  "Takeaways",
  "Study Guide",
  "FAQ",
  "Timeline",
  "Briefing Doc",
];

interface NotebookGuideProps {
  selected: Set<string>;
  workspaceId: string;
}

interface GeneratedArtifact {
  tool: string;
  content: string;
}

export function NotebookGuide({
  selected,
  workspaceId,
}: NotebookGuideProps) {
  const [generatingTool, setGeneratingTool] = useState<string | null>(null);
  const [activeArtifact, setActiveArtifact] =
    useState<GeneratedArtifact | null>(null);

  const handleGenerate = async (tool: string) => {
    if (selected.size === 0) {
      toast.error("Please select at least one source from the left panel.");
      return;
    }

    setGeneratingTool(tool);
    setActiveArtifact(null);

    try {
      const response = await fetch(
        `/api/workspaces/${workspaceId}/chat/guide`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tool,
            sourceIds: Array.from(selected),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.error || "Failed to generate artifact",
        );
      }

      const data: { text?: string } = await response.json();

      if (typeof data.text !== "string" || !data.text.trim()) {
        throw new Error("The generated guide was empty");
      }

      setActiveArtifact({
        tool,
        content: data.text.trim(),
      });

      toast.success(`${tool} generated successfully.`);
    } catch (error) {
      console.error("Notebook Guide generation failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate guide.",
      );
    } finally {
      setGeneratingTool(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-10 flex items-center gap-5">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary shadow-sm">
          <BookOpen className="size-7" />
        </div>

        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            Notebook Guide
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Generate comprehensive artifacts and study tools from your
            selected sources.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Button
            key={tool}
            variant="outline"
            className="group relative flex h-auto min-h-[120px] cursor-pointer flex-col items-start gap-2 overflow-hidden rounded-2xl border bg-card p-5 text-left whitespace-normal shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            onClick={() => handleGenerate(tool)}
            disabled={generatingTool !== null}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative z-10 flex w-full items-center justify-between">
              <h4 className="font-semibold text-foreground/90">
                {tool}
              </h4>

              {generatingTool === tool && (
                <Loader2 className="size-4 animate-spin text-primary" />
              )}
            </div>

            <p className="relative z-10 text-xs leading-relaxed text-muted-foreground">
              Generate a comprehensive {tool.toLowerCase()} based on your
              currently selected sources.
            </p>
          </Button>
        ))}
      </div>

      {activeArtifact && (
        <div className="relative mt-12 overflow-hidden rounded-2xl border bg-card p-6 shadow-sm md:p-8">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary/40 to-primary/10" />

          <div className="mb-6 flex items-center gap-3 border-b pb-4">
            <FileText className="size-5 text-primary" />

            <h3 className="font-heading text-xl font-bold">
              {activeArtifact.tool}
            </h3>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-4"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {activeArtifact.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
