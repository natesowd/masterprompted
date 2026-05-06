import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

// Set up the worker
// @ts-expect-error — Vite ?url import has no declared type
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';

if (pdfjsWorker) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Polyfill for ReadableStream.prototype.values which is required by pdfjs-dist 5.x
// but might be missing in some browser versions (e.g. Safari < 17).
type StreamProtoExt = {
    values?: () => AsyncIterableIterator<unknown>;
    [Symbol.asyncIterator]?: () => AsyncIterableIterator<unknown>;
};
const streamProto = ReadableStream.prototype as unknown as StreamProtoExt;
if (typeof ReadableStream !== 'undefined' && !streamProto.values) {
    streamProto.values = function (this: ReadableStream<unknown>) {
        const reader = this.getReader();
        return {
            next() {
                return reader.read();
            },
            [Symbol.asyncIterator]() {
                return this;
            },
            return() {
                reader.releaseLock();
                return Promise.resolve({ done: true, value: undefined });
            }
        } as AsyncIterableIterator<unknown>;
    };
    if (!streamProto[Symbol.asyncIterator]) {
        streamProto[Symbol.asyncIterator] = streamProto.values;
    }
}

/**
 * Extracts all text content from a PDF file, plus the document's metadata title
 * (if present). Surfacing the title separately lets the LLM cite the document
 * by its real name instead of just the file name.
 *
 * @param file The PDF file to parse.
 * @returns A promise that resolves to the extracted text and optional title.
 */
export async function extractTextFromPDF(file: File): Promise<{ text: string; title?: string }> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        disableStream: true,
        disableRange: true
    });
    const pdf = await loadingTask.promise;

    // Best-effort: read the PDF's embedded title from its metadata.
    // Skip generic placeholders that authoring tools set by default.
    let title: string | undefined;
    try {
        const meta = (await pdf.getMetadata()) as { info?: { Title?: unknown } } | undefined;
        const infoTitle: unknown = meta?.info?.Title;
        if (typeof infoTitle === 'string') {
            const cleaned = infoTitle.trim();
            if (cleaned && !/^(microsoft\s+word|untitled|document\d*|.*\.(docx?|pdf))$/i.test(cleaned)) {
                title = cleaned;
            }
        }
    } catch {
        // Metadata read failed — leave title undefined.
    }

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        // Use some options to make it more robust
        const textContent = await page.getTextContent();

        // Ensure textContent and items exist
        if (textContent && textContent.items) {
            const pageText = (textContent.items as Array<{ str?: string }>)
                .map((item) => item.str ?? '')
                .join(' ');
            fullText += pageText + '\n';
        }
    }

    return { text: fullText.trim(), title };
}
