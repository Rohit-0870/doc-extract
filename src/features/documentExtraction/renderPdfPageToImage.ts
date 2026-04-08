import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// ✅ Keep this Vite-compatible worker import
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = workerSrc;

export async function renderPdfPageToImage(
  file: File | string,
  pageNumber = 1,
  scale = 2
) {
  let loadingTask;

  // 1. Load the data
  if (typeof file === "string") {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    const data = await response.arrayBuffer();
    loadingTask = getDocument({ data });
  } else {
    const data = await file.arrayBuffer();
    loadingTask = getDocument({ data });
  }

  const pdf = await loadingTask.promise;

  try {
    // 2. Render the page
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: ctx,
      viewport,
      canvas: canvas, 
    }).promise;

    const result = {
      imageUrl: canvas.toDataURL("image/png"),
      width: viewport.width,
      height: viewport.height,
    };

    // 3. ✅ CLEANUP: Release page resources
    page.cleanup();

    return result;
  } finally {
    // 4. ✅ CLEANUP: Destroy the document instance to free up memory
    await pdf.destroy();
  }
}