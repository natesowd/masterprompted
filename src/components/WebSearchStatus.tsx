/**
 * WebSearchStatus
 *
 * Shows phase-specific loading / status indicators during the web search RAG flow.
 */

import { Globe, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

type SearchStatus = "searching" | "complete" | "error";

interface WebSearchStatusProps {
  status: SearchStatus;
  resultCount?: number;
  className?: string;
}

const WebSearchStatus: React.FC<WebSearchStatusProps> = ({
  status,
  resultCount = 0,
  className = "",
}) => {
  if (status === "searching") {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground py-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        <Globe className="h-4 w-4 text-blue-500" />
        <span>Searching the web...</span>
      </div>
    );
  }

  if (status === "complete") {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground py-2 ${className}`}>
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span>Found {resultCount} source{resultCount !== 1 ? "s" : ""}. Generating answer...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`flex items-center gap-2 text-sm text-amber-600 py-2 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span>Search unavailable. Answering without web sources.</span>
      </div>
    );
  }

  return null;
};

export default WebSearchStatus;
