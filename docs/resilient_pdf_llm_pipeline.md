# Resilient PDF-LLM Pipeline Documentation

## 1. Hybrid Extraction (pdf.js + Tesseract.js)
**Objective:** Handle both digital and scanned PDF pages.
- **Current State:** Basic `pdf.js` implementation active. OCR fallback planned.
- **Logic:** 
    - Perform initial extraction via `page.getTextContent()`.
    - If `textContent.items.length < 5` OR `totalChars < 50`, trigger OCR fallback (Future).

## 2. Map-Reduce Summarization Architecture
**Objective:** Process 128k+ tokens across Netlify (26s) and HF/OVH limits.
- **Current State:** Single-pass streaming implemented. Chunking/Map-Reduce planned for very large documents.
- **Chunking Module:** 
    - Split text into segments of ~4,000 tokens at paragraph boundaries.

## 3. Streaming & Timeout Observability
**Objective:** Monitor and log "Silent Kills" in the Netlify -> HF -> OVH chain.
- **Current State: [IMPLEMENTED]**
- **Execution Guard:**
    - `AbortController` active in Netlify function, set to 25 seconds (Netlify limit: 26s).
- **Integrity Monitor:**
    - `TransformStream` implemented in `PromptPlayground.tsx`.
    - Logic uses the `flush()` hook to verify if the stream reached a natural conclusion. 
- **Telemetry Note (Proposed):** 
    - Future enhancement: Prepend telemetry chunks with `__TELEMETRY__:` to forward server-side headers (`x-compute-time`, `x-request-id`) and "Silent Kill" token counts directly to the browser console.

## 4. Netlify Execution Strategy
- **Current State: [IMPLEMENTED]**
- **Streaming Configuration:**
    - Netlify V2 function used for Standard Web Streams (SSE style).
    - If the 25s timeout triggers, the function logs the final token count to identify the "Silent Kill" depth.
- **Payload Management:**
    - 6MB JSON payload verification active on both Client (before fetch) and Server (on request init).

## 5. Error Broadcasting
- **Current State: [IMPLEMENTED]**
- **Partial Results:** 
    - If a stream is interrupted or the `isStreamComplete` flag is false after the reader loop, the UI appends a `[PARTIAL_RESULT - Connection Interrupted]` marker to the text.
    - Console logs an `IncompleteStreamError` for developer debugging.