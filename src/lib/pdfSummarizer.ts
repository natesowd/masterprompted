/**
 * Stopgap map-reduce PDF summarization pipeline.
 * Chunks extracted PDF text, summarizes each chunk via LLM, then reduces
 * chunk summaries into a single document summary.
 */

import { SSEContentParser } from "./sseStream";

const CHARS_PER_TOKEN = 3.5;
const CHUNK_TOKEN_TARGET = 4000;
const CHUNK_CHAR_TARGET = CHUNK_TOKEN_TARGET * CHARS_PER_TOKEN; // ~14,000
const SHORT_DOC_TOKEN_THRESHOLD = 6000;
const SHORT_DOC_CHAR_THRESHOLD = SHORT_DOC_TOKEN_THRESHOLD * CHARS_PER_TOKEN; // ~21,000
const REDUCE_TOKEN_THRESHOLD = 30000;
const REDUCE_CHAR_THRESHOLD = REDUCE_TOKEN_THRESHOLD * CHARS_PER_TOKEN; 
const MAX_REDUCE_DEPTH = 2;
const CONCURRENCY = 3;
const SUMMARIZE_MODEL = "Qwen/Qwen3-32B";
const TRUNCATE_FALLBACK_WORDS = 500;

export interface SummarizationResult {
  summary: string;
  originalTokenCount: number;
  summaryTokenCount: number;
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

/** Split text into ~4k-token chunks at paragraph boundaries. */
export function chunkText(text: string, chunkCharTarget: number = CHUNK_CHAR_TARGET): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // If a single paragraph exceeds the target, split at sentence boundaries
    if (trimmed.length > chunkCharTarget) {
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      const sentences = splitSentences(trimmed);
      let sentenceChunk = '';
      for (const sentence of sentences) {
        if (sentenceChunk.length + sentence.length > chunkCharTarget && sentenceChunk) {
          chunks.push(sentenceChunk.trim());
          sentenceChunk = '';
        }
        sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
      }
      if (sentenceChunk) chunks.push(sentenceChunk.trim());
      continue;
    }

    if (current.length + trimmed.length + 2 > chunkCharTarget && current) {
      chunks.push(current.trim());
      current = '';
    }
    current += (current ? '\n\n' : '') + trimmed;
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Split text at sentence boundaries (period + space + uppercase, or period at end). */
function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?]*[.!?]+(?:\s+|$)|[^.!?]+$/g);
  return parts ? parts.map(s => s.trim()).filter(Boolean) : [text];
}

// ---------------------------------------------------------------------------
// API call helper
// ---------------------------------------------------------------------------

async function callLLM(
  apiUrl: string,
  systemPrompt: string,
  userPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  // Use streaming to avoid Netlify's 26s idle timeout on edge functions.
  // The edge function forwards raw SSE frames, so we parse `delta.content`
  // client-side via SSEContentParser.
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: SUMMARIZE_MODEL,
      temperature: 0.3,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Summarization LLM call failed: ${response.status} - ${errorText}`);
  }

  // Parse SSE frames client-side and accumulate the content deltas
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const parser = new SSEContentParser();
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      result += parser.flush().join('');
      break;
    }
    result += parser.feed(decoder.decode(value, { stream: true })).join('');
  }

  return result.trim();
}

// ---------------------------------------------------------------------------
// Map phase
// ---------------------------------------------------------------------------

const MAP_SYSTEM_PROMPT =
  'You are a precise document summarizer. Produce a factual summary of the following text section. ' +
  'Rules: (1) Preserve ALL names, dates, numbers, statistics, and quoted statements exactly as written — do not round, approximate, or rephrase numerical data. ' +
  '(2) Do not infer, interpret, or add information not explicitly stated in the text. ' +
  '(3) If a passage is ambiguous, summarize what it literally says rather than what it might mean. ' +
  '(4) Do not add commentary, opinions, or conclusions beyond what the text states.';

async function summarizeChunk(
  chunk: string,
  chunkIndex: number,
  totalChunks: number,
  apiUrl: string,
  signal?: AbortSignal
): Promise<string> {
  const userPrompt = `Summarize this section (part ${chunkIndex + 1} of ${totalChunks}):\n\n${chunk}`;

  // Try once, retry once on failure, then truncate as fallback
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await callLLM(apiUrl, MAP_SYSTEM_PROMPT, userPrompt, signal);
    } catch (err) {
      if (attempt === 0) {
        console.warn(`Chunk ${chunkIndex + 1} summarization failed, retrying...`, err);
        continue;
      }
      console.warn(`Chunk ${chunkIndex + 1} summarization failed after retry, truncating.`, err);
      const words = chunk.split(/\s+/).slice(0, TRUNCATE_FALLBACK_WORDS);
      return words.join(' ') + '...';
    }
  }
  // Unreachable but satisfies TypeScript
  return chunk.split(/\s+/).slice(0, TRUNCATE_FALLBACK_WORDS).join(' ') + '...';
}

// ---------------------------------------------------------------------------
// Reduce phase
// ---------------------------------------------------------------------------

const REDUCE_SYSTEM_PROMPT =
  'You are a precise document summarizer. Combine the following section summaries into a single coherent document summary. ' +
  'Rules: (1) Preserve ALL names, dates, numbers, and statistics exactly as they appear — do not alter any factual details during consolidation. ' +
  '(2) If two sections contain the same fact stated differently, preserve both versions rather than choosing one. ' +
  '(3) Maintain logical flow but never add connective statements that introduce new claims. ' +
  '(4) Be concise without sacrificing factual precision.';

async function reduceSummaries(
  summaries: string[],
  apiUrl: string,
  depth: number = 0,
  signal?: AbortSignal
): Promise<string> {
  const combined = summaries.join('\n\n---\n\n');

  // If combined is small enough or we've hit max depth, do a single reduce
  if (combined.length <= REDUCE_CHAR_THRESHOLD || depth >= MAX_REDUCE_DEPTH) {
    return await callLLM(
      apiUrl,
      REDUCE_SYSTEM_PROMPT,
      `Combine these section summaries into one document summary:\n\n${combined}`,
      signal
    );
  }

  // Otherwise, chunk the summaries and recurse
  const chunks = chunkText(combined, REDUCE_CHAR_THRESHOLD);
  const subSummaries: string[] = [];
  for (const chunk of chunks) {
    const sub = await callLLM(
      apiUrl,
      REDUCE_SYSTEM_PROMPT,
      `Combine these section summaries into one document summary:\n\n${chunk}`,
      signal
    );
    subSummaries.push(sub);
  }
  return reduceSummaries(subSummaries, apiUrl, depth + 1, signal);
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/** Process map calls with a concurrency limit. */
async function mapWithConcurrency<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<string>,
  concurrency: number
): Promise<string[]> {
  const results: string[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const idx = nextIndex++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function summarizeDocument(
  text: string,
  apiUrl: string,
  onProgress?: (phase: string, current: number, total: number) => void,
  signal?: AbortSignal
): Promise<SummarizationResult> {
  const originalTokenCount = Math.ceil(text.length / CHARS_PER_TOKEN);

  // Short-circuit: small documents get a single summarization call
  if (text.length <= SHORT_DOC_CHAR_THRESHOLD) {
    onProgress?.('summarize', 1, 1);
    const summary = await callLLM(
      apiUrl,
      MAP_SYSTEM_PROMPT,
      `Summarize the following document:\n\n${text}`,
      signal
    );
    return {
      summary,
      originalTokenCount,
      summaryTokenCount: Math.ceil(summary.length / CHARS_PER_TOKEN),
    };
  }

  // Chunk
  const chunks = chunkText(text);
  console.log(`[pdfSummarizer] Split document into ${chunks.length} chunks (~${CHUNK_TOKEN_TARGET} tokens each)`);

  // Map phase: summarize each chunk with concurrency limit
  const chunkSummaries = await mapWithConcurrency(
    chunks,
    async (chunk, idx) => {
      onProgress?.('map', idx + 1, chunks.length);
      return summarizeChunk(chunk, idx, chunks.length, apiUrl, signal);
    },
    CONCURRENCY
  );

  // Reduce phase: combine summaries
  onProgress?.('reduce', 1, 1);
  const summary = await reduceSummaries(chunkSummaries, apiUrl, 0, signal);

  return {
    summary,
    originalTokenCount,
    summaryTokenCount: Math.ceil(summary.length / CHARS_PER_TOKEN),
  };
}
