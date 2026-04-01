/**
 * Shared fetch utility with retry logic for evaluation API calls.
 *
 * Retries once on failure (network error or non-2xx status).
 */

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2000;

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with a single retry on failure.
 * Retries on network errors and 5xx responses.
 */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.ok || response.status < 500) {
        return response;
      }
      // 5xx — worth retrying
      if (attempt < MAX_RETRIES) {
        console.warn(`[fetchWithRetry] ${url} returned ${response.status}, retrying in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS);
        continue;
      }
      return response;
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        console.warn(`[fetchWithRetry] ${url} failed with ${error}, retrying in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS);
        continue;
      }
      throw error;
    }
  }
  // Unreachable, but satisfies TypeScript
  throw new Error(`[fetchWithRetry] ${url} failed after ${MAX_RETRIES + 1} attempts`);
}
