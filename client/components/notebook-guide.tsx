import { useState } from "react";
import { BookOpen, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

export function NotebookGuide({ selected, workspaceId }: NotebookGuideProps) {
  const [generatingTool, setGeneratingTool] = useState<string | null>(null);
  const [activeArtifact, setActiveArtifact] = useState<{
    tool: string;
    content: string;
  } | null>(null);

  const handleGenerate = async (tool: string) => {
    if (selected.size === 0) {
      toast.error("Please select at least one source from the left panel.");
      return;
    }

    setGeneratingTool(tool);
    setActiveArtifact(null); // Clear previous artifact while generating

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/chat/guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          sourceIds: Array.from(selected),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate artifact");
      }

      const data = await response.json();
      
      setGeneratingTool(null);
      setActiveArtifact({
        tool,
        content: data.text,
      });
      toast.success(`${tool} generated successfully.`);
    } catch (err) {
        console.error(err);
        toast.error("Failed to generate guide.");
        setGeneratingTool(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl w-full">
      <div className="mb-10 flex items-center gap-5">
        <div className="rounded-2xl bg-primary/10 p-4 text-primary border border-primary/20 shadow-sm">
          <BookOpen className="size-7" />
        </div>
        <div>
          <h2 className="font-heading text-3xl font-bold tracking-tight">Notebook Guide</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Generate comprehensive artifacts and study tools from your selected sources.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Button
            key={tool}
            variant="outline"
            className="group flex h-auto min-h-[120px] cursor-pointer flex-col items-start gap-2 rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 whitespace-normal text-left relative overflow-hidden"
            onClick={() => handleGenerate(tool)}
            disabled={generatingTool !== null}
          >
            {/* Subtle glass reflection on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="flex w-full items-center justify-between relative z-10">
              <h4 className="font-semibold text-foreground/90">{tool}</h4>
              {generatingTool === tool && <Loader2 className="size-4 animate-spin text-primary" />}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed relative z-10">
              Generate a comprehensive {tool.toLowerCase()} based on your currently selected sources.
            </p>
          </Button>
        ))}
      </div>

      {activeArtifact && (
        <div className="mt-12 rounded-2xl border bg-card p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 to-primary/10" />
          <div className="mb-6 flex items-center gap-3 border-b pb-4">
            <FileText className="size-5 text-primary" />
            <h3 className="font-heading text-xl font-bold">{activeArtifact.tool}</h3>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {/* Extremely simple markdown rendering for the mock text */}
            {activeArtifact.content.split('\n').map((line, i) => {
              if (line.startsWith('### ')) return <h4 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h4>;
              if (line.trim() === '') return <br key={i} />;
              // Bold replacement
              const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: boldedLine }} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
