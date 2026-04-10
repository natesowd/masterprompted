/**
 * Web Search RAG — barrel exports
 */

export { searchWeb, searchResultsToDocuments } from "./webSearchClient";
export type { WebSearchResult, ChatDocument } from "./webSearchClient";

export { runWebSearchRAG } from "./webSearchOrchestrator";
export type { WebSearchRAGOptions, WebSearchRAGResult } from "./webSearchOrchestrator";
