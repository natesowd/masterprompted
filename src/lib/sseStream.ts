/**
 * Stateful parser for OpenAI-compatible SSE streams.
 *
 * The edge function forwards raw SSE frames from HuggingFace so the full JSON
 * (including any provider-specific fields like Cohere citations) is visible in
 * the browser's Network tab. Consumers use this parser to extract the content
 * deltas for display while the raw stream remains inspectable.
 */
export class SSEContentParser {
  private buffer = "";

  /**
   * Process a decoded text chunk from the stream and return any extracted
   * `delta.content` strings.
   */
  feed(chunk: string): string[] {
    this.buffer += chunk;
    const lines = this.buffer.split("\n");
    // Keep the last (possibly incomplete) line in the buffer
    this.buffer = lines.pop() || "";

    const results: string[] = [];
    for (const line of lines) {
      const content = this.extractContent(line);
      if (content) results.push(content);
    }
    return results;
  }

  /** Flush any remaining buffered content at end of stream. */
  flush(): string[] {
    const remaining = this.buffer;
    this.buffer = "";
    if (!remaining) return [];
    const content = this.extractContent(remaining);
    return content ? [content] : [];
  }

  private extractContent(line: string): string | null {
    if (!line.startsWith("data: ")) return null;
    const payload = line.slice(6).trim();
    if (!payload || payload === "[DONE]") return null;
    try {
      const parsed = JSON.parse(payload);
      return parsed.choices?.[0]?.delta?.content ?? null;
    } catch {
      return null;
    }
  }
}
