/**
 * WebSearchReferences
 *
 * Renders a numbered list of web search sources below the LLM answer.
 * Each entry shows a favicon, clickable title, and domain name.
 */

import type { WebSearchResult } from "@/services/webSearch";

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface WebSearchReferencesProps {
  sources: WebSearchResult[];
  className?: string;
}

const WebSearchReferences: React.FC<WebSearchReferencesProps> = ({
  sources,
  className = "",
}) => {
  if (sources.length === 0) return null;

  return (
    <div className={`mt-4 border-t border-border pt-3 ${className}`}>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Sources
      </h4>
      <ol className="space-y-1.5">
        {sources.map((source) => {
          const domain = extractDomain(source.url);
          return (
            <li key={source.position} className="flex items-start gap-2 text-sm">
              <span className="inline-flex items-center justify-center min-w-[1.4em] h-[1.4em] px-1 text-[0.7em] font-semibold rounded bg-blue-100 text-blue-700 border border-blue-200 mt-0.5 flex-shrink-0">
                {source.position}
              </span>
              <img
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                alt=""
                width={16}
                height={16}
                className="mt-0.5 flex-shrink-0 rounded-sm"
                loading="lazy"
              />
              <div className="min-w-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-600 break-words"
                >
                  {source.title}
                </a>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {domain}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default WebSearchReferences;
