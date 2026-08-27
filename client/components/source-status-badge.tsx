import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import type { SourceStatus } from "@/lib/config";
import { cn } from "@/lib/utils";

export default function SourceStatusBadge({
  status,
  className,
}: {
  status: SourceStatus;
  className?: string;
}) {
  if (status === "READY") {
    // Hide the badge if it's ready, or optionally show a very subtle checkmark
    return null;
  }

  if (status === "PENDING" || status === "PROCESSING") {
    return (
      <div className={cn("flex items-center gap-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md", className)}>
        <Loader2 className="size-3 animate-spin" />
        Processing
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className={cn("flex items-center gap-1.5 text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md", className)}>
        <AlertCircle className="size-3" />
        Failed
      </div>
    );
  }

  return null;
}
