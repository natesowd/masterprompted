import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

// Set up the worker
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';

if (pdfjsWorker) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Polyfill for ReadableStream.prototype.values which is required by pdfjs-dist 5.x 
// but might be missing in some browser versions (e.g. Safari < 17).
if (typeof ReadableStream !== 'undefined' && !((ReadableStream.prototype as any).values)) {
    // @ts-ignore
    ReadableStream.prototype.values = function () {
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
        };
    };
    if (!(ReadableStream.prototype as any)[Symbol.asyncIterator]) {
        // @ts-ignore
        ReadableStream.prototype[Symbol.asyncIterator] = ReadableStream.prototype.values;
    }
}

/**
 * Extracts all text content from a PDF file.
 * @param file The PDF file to parse.
 * @returns A promise that resolves to the extracted text.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        disableStream: true,
        disableRange: true
    });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        // Use some options to make it more robust
        const textContent = await page.getTextContent();

        // Ensure textContent and items exist
        if (textContent && textContent.items) {
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }
    }

    return fullText.trim();
}
