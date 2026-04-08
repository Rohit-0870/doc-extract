
// import { useEffect, useState, useMemo } from "react";
// import { FileText } from "lucide-react";
// import type {
//   DocumentExtractionResponse,
//   PageDimension,
//   OcrWord,
//   OcrLine,
//   BoundingBox,
// } from "@/features/documentExtraction/documentTypes";
// import { SelectableDocPage } from "./SelectableDocPage";
// import { renderPdfPageToImage } from "@/features/documentExtraction/renderPdfPageToImage";

// interface DocumentPreviewProps {
//   file?: string | File;
//   extraction?: DocumentExtractionResponse | null;
//   hoveredFieldName?: string | null;
//   activeFieldName?: string | null;
//   scrollToken?: number;
// }

// export function DocumentPreview({
//   file,
//   extraction,
//   hoveredFieldName,
//   activeFieldName,
//   scrollToken,
// }: DocumentPreviewProps) {
//   const [fileUrl, setFileUrl] = useState<string | null>(null);
//   const [pageImageUrl, setPageImageUrl] = useState<string | null>(null);
//   const [pageDims, setPageDims] = useState<{ width: number; height: number } | null>(null);

//   const fileName =
//     typeof file === "string"
//       ? file.split("/").pop() ?? "Document"
//       : file?.name ?? "Document";

//   const getExtension = (value: string) =>
//   value.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

//   const isImage =
//     (file instanceof File && file.type.startsWith("image/")) ||
//     (typeof file === "string" &&
//       ["png", "jpg", "jpeg", "webp", "gif"].includes(getExtension(file)));

//   const isPdf =
//     (file instanceof File && file.type === "application/pdf") ||
//     (typeof file === "string" && getExtension(file) === "pdf");

//   const activePageNumber = useMemo(() => {
//     if (!activeFieldName || !extraction) return 1;
//     const field = extraction.extracted_values?.find(
//       (v) => v.field_name === activeFieldName
//     );
//     return field?.page_number || 1;
//   }, [activeFieldName, extraction]);

//   /* ---------- File URL ---------- */

//   useEffect(() => {
//     if (!file) {
//       setFileUrl(null);
//       return;
//     }

//     if (typeof file === "string") {
//       setFileUrl(file);
//       return;
//     }

//     const url = URL.createObjectURL(file);
//     setFileUrl(url);

//     return () => URL.revokeObjectURL(url);
//   }, [file]);

//   /* ---------- Unified Render Pipeline ---------- */

//   useEffect(() => {
//     if (!file || !fileUrl) return;

//     let cancelled = false;

//     const process = async () => {
//       try {
//         // ✅ PDF → render to image
//         if (isPdf) {
//           const rendered = await renderPdfPageToImage(
//             file as any,
//             activePageNumber,
//             2
//           );

//           if (!cancelled) {
//             setPageImageUrl(rendered.imageUrl);
//             setPageDims({
//               width: rendered.width,
//               height: rendered.height,
//             });
//           }

//           return;
//         }

//         // ✅ Image → preload + read natural dimensions
//         if (isImage) {
//           const img = new Image();
//           img.onload = () => {
//             if (!cancelled) {
//               setPageImageUrl(fileUrl);
//               setPageDims({
//                 width: img.naturalWidth,
//                 height: img.naturalHeight,
//               });
//             }
//           };
//           img.src = fileUrl;
//         }
//       } catch (err) {
//         console.error("Document render failed:", err);
//       }
//     };

//     process();

//     return () => {
//       cancelled = true;
//     };
//   }, [file, fileUrl, isPdf, isImage, activePageNumber]);

//   /* ---------- Page + OCR ---------- */

//   const currentPageDims = useMemo(() => {
//     if (!extraction?.page_dimensions?.length) return null;
//     return (
//       extraction.page_dimensions.find(
//         (p) => Number(p.page_number) === activePageNumber
//       ) ?? null
//     );
//   }, [extraction, activePageNumber]);

//   const currentPageLines = useMemo(() => {
//     const rawLines = extraction?.ocr_lines || [];
//     return rawLines.filter((l) => {
//       const itemPage = Number(
//         l.page_number || (l as any).pageNumber || 1
//       );
//       return itemPage === Number(activePageNumber);
//     });
//   }, [extraction, activePageNumber]);

//   const currentPageWords = useMemo(() => {
//     const rawWords = extraction?.ocr_words || [];
//     return rawWords.filter((w) => {
//       const itemPage = Number(
//         w.page_number || (w as any).pageNumber || 1
//       );
//       return itemPage === Number(activePageNumber);
//     });
//   }, [extraction, activePageNumber]);

//   const resolveBoxes = (fieldName: string | null | undefined) => {
//   if (!fieldName || !extraction) return [];
  
//   // Find the specific value
//   const ev = extraction.extracted_values?.find(
//     (v) => v.field_name === fieldName
//   );

//   // Check if bounding_box exists and matches the current page
//   if (!ev || !ev.bounding_box) return [];
//   if (Number(ev.page_number || 1) !== activePageNumber) return [];

//   // If the API returns an array of boxes for one field, handle it.
//   // Otherwise, wrap the single box in an array.
//   return Array.isArray(ev.bounding_box) ? ev.bounding_box : [ev.bounding_box];
// };

//   const hoverBoxes = useMemo(
//     () => resolveBoxes(hoveredFieldName),
//     [hoveredFieldName, extraction, activePageNumber]
//   );

//   const focusBoxes = useMemo(
//     () => resolveBoxes(activeFieldName),
//     [activeFieldName, extraction, activePageNumber]
//   );


//   /* ---------- Render ---------- */

//   if (!file) {
//     return (
//       <div className="flex h-full items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8">
//         <div className="text-center text-muted-foreground">
//           <FileText className="mx-auto h-12 w-12 opacity-50" />
//           <p className="mt-2 text-sm">No document uploaded</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full rounded-xl border bg-card overflow-hidden">
//       <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
//         <h3 className="text-sm font-semibold">Document Preview</h3>
//         <span className="text-xs truncate max-w-[200px]">
//           {fileName}
//         </span>
//       </div>

//       <div className="h-[calc(100%-52px)] bg-muted/10">
//         {pageImageUrl && pageDims && currentPageDims && (
//           <SelectableDocPage
//           pageImageUrl={pageImageUrl}
//           page={currentPageDims}
//           lines={currentPageLines}
//           words={currentPageWords}
//           renderedWidth={pageDims?.width}
//           renderedHeight={pageDims?.height}
//           highlightBoxes={hoverBoxes}
//           focusBoxes={focusBoxes}
//           scrollToken={scrollToken}
//         />
//         )}
//       </div>
//     </div>
//   );
// }



// import { useEffect, useState, useMemo } from "react";
// import { FileText } from "lucide-react";
// import type {
//   DocumentExtractionResponse,
//   PageDimension,
//   OcrWord,
//   OcrLine,
//   BoundingBox,
// } from "@/features/documentExtraction/documentTypes";
// import { SelectableDocPage } from "./SelectableDocPage";
// import { renderPdfPageToImage } from "@/features/documentExtraction/renderPdfPageToImage";

// interface DocumentPreviewProps {
//   file?: string | File;
//   extraction?: DocumentExtractionResponse | null;
//   hoveredFieldName?: string | null;
//   activeFieldName?: string | null;
//   scrollToken?: number;
// }

// export function DocumentPreview({
//   file,
//   extraction,
//   hoveredFieldName,
//   activeFieldName,
//   scrollToken,
// }: DocumentPreviewProps) {
//   const [fileUrl, setFileUrl] = useState<string | null>(null);
//   const [pageImageUrl, setPageImageUrl] = useState<string | null>(null);
//   const [pageDims, setPageDims] = useState<{ width: number; height: number } | null>(null);

//   const fileName =
//     typeof file === "string"
//       ? file.split("/").pop() ?? "Document"
//       : file?.name ?? "Document";

//   const getExtension = (value: string) =>
//   value.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

//   const isImage =
//     (file instanceof File && file.type.startsWith("image/")) ||
//     (typeof file === "string" &&
//       ["png", "jpg", "jpeg", "webp", "gif"].includes(getExtension(file)));

//   const isPdf =
//     (file instanceof File && file.type === "application/pdf") ||
//     (typeof file === "string" && getExtension(file) === "pdf");

//   const activePageNumber = useMemo(() => {
//     if (!activeFieldName || !extraction) return 1;
//     const field = extraction.extracted_values?.find(
//       (v) => v.field_name === activeFieldName
//     );
//     return field?.page_number || 1;
//   }, [activeFieldName, extraction]);

//   /* ---------- File URL ---------- */

//   useEffect(() => {
//     if (!file) {
//       setFileUrl(null);
//       return;
//     }

//     if (typeof file === "string") {
//       setFileUrl(file);
//       return;
//     }

//     const url = URL.createObjectURL(file);
//     setFileUrl(url);

//     return () => URL.revokeObjectURL(url);
//   }, [file]);

//   /* ---------- Unified Render Pipeline ---------- */

//   useEffect(() => {
//     if (!file || !fileUrl) return;

//     let cancelled = false;

//     const process = async () => {
//       try {
//         // ✅ PDF → render to image
//         if (isPdf) {
//           const rendered = await renderPdfPageToImage(
//             file as any,
//             activePageNumber,
//             2
//           );

//           if (!cancelled) {
//             setPageImageUrl(rendered.imageUrl);
//             setPageDims({
//               width: rendered.width,
//               height: rendered.height,
//             });
//           }

//           return;
//         }

//         // ✅ Image → preload + read natural dimensions
//         if (isImage) {
//           const img = new Image();
//           img.onload = () => {
//             if (!cancelled) {
//               setPageImageUrl(fileUrl);
//               setPageDims({
//                 width: img.naturalWidth,
//                 height: img.naturalHeight,
//               });
//             }
//           };
//           img.src = fileUrl;
//         }
//       } catch (err) {
//         console.error("Document render failed:", err);
//       }
//     };

//     process();

//     return () => {
//       cancelled = true;
//     };
//   }, [file, fileUrl, isPdf, isImage, activePageNumber]);

//   /* ---------- Page + OCR ---------- */

//   const currentPageDims = useMemo(() => {
//     if (!extraction?.page_dimensions?.length) return null;
//     return (
//       extraction.page_dimensions.find(
//         (p) => Number(p.page_number) === activePageNumber
//       ) ?? null
//     );
//   }, [extraction, activePageNumber]);

//   const currentPageLines = useMemo(() => {
//     const rawLines = extraction?.ocr_lines || [];
//     return rawLines.filter((l) => {
//       const itemPage = Number(
//         l.page_number || (l as any).pageNumber || 1
//       );
//       return itemPage === Number(activePageNumber);
//     });
//   }, [extraction, activePageNumber]);

//   const currentPageWords = useMemo(() => {
//     const rawWords = extraction?.ocr_words || [];
//     return rawWords.filter((w) => {
//       const itemPage = Number(
//         w.page_number || (w as any).pageNumber || 1
//       );
//       return itemPage === Number(activePageNumber);
//     });
//   }, [extraction, activePageNumber]);

//   const resolveBoxes = (fieldName: string | null | undefined) => {
//   if (!fieldName || !extraction) return [];
  
//   // Find the specific value
//   const ev = extraction.extracted_values?.find(
//     (v) => v.field_name === fieldName
//   );

//   // Check if bounding_box exists and matches the current page
//   if (!ev || !ev.bounding_box) return [];
//   if (Number(ev.page_number || 1) !== activePageNumber) return [];

//   // If the API returns an array of boxes for one field, handle it.
//   // Otherwise, wrap the single box in an array.
//   return Array.isArray(ev.bounding_box) ? ev.bounding_box : [ev.bounding_box];
// };

//   const hoverBoxes = useMemo(
//     () => resolveBoxes(hoveredFieldName),
//     [hoveredFieldName, extraction, activePageNumber]
//   );

//   const focusBoxes = useMemo(
//     () => resolveBoxes(activeFieldName),
//     [activeFieldName, extraction, activePageNumber]
//   );


//   /* ---------- Render ---------- */

//   if (!file) {
//     return (
//       <div className="flex h-full items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8">
//         <div className="text-center text-muted-foreground">
//           <FileText className="mx-auto h-12 w-12 opacity-50" />
//           <p className="mt-2 text-sm">No document uploaded</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-full rounded-xl border bg-card overflow-hidden">
//       <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
//         <h3 className="text-sm font-semibold">Document Preview</h3>
//         <span className="text-xs truncate max-w-[200px]">
//           {fileName}
//         </span>
//       </div>

//       <div className="h-[calc(100%-52px)] bg-muted/10">
//         {pageImageUrl && pageDims && currentPageDims && (
//           <SelectableDocPage
//           pageImageUrl={pageImageUrl}
//           page={currentPageDims}
//           lines={currentPageLines}
//           words={currentPageWords}
//           renderedWidth={pageDims?.width}
//           renderedHeight={pageDims?.height}
//           highlightBoxes={hoverBoxes}
//           focusBoxes={focusBoxes}
//           scrollToken={scrollToken}
//         />
//         )}
//       </div>
//     </div>
//   );
// }


import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type {
  DocumentExtractionResponse,
  PageDimension,
  OcrWord,
  OcrLine,
  BoundingBox,
} from "@/features/documentExtraction/documentTypes";
import { SelectableDocPage } from "./SelectableDocPage";
import { renderPdfPageToImage } from "@/features/documentExtraction/renderPdfPageToImage";

interface DocumentPreviewProps {
  file?: string | File;
  extraction?: DocumentExtractionResponse | null;
  hoveredFieldName?: string | null;
  activeFieldName?: string | null;
  scrollToken?: number;
}

export function DocumentPreview({
  file,
  extraction,
  hoveredFieldName,
  activeFieldName,
  scrollToken,
}: DocumentPreviewProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pageImageUrl, setPageImageUrl] = useState<string | null>(null);
  const [pageDims, setPageDims] = useState<{ width: number; height: number } | null>(null);
  const pageCache = useRef<Map<number, any>>(new Map());

  // ✅ NEW STATE
  const [manualPage, setManualPage] = useState<number | null>(null);
  const [hoverPage, setHoverPage] = useState<number | null>(null);

  const fileName =
    typeof file === "string"
      ? file.split("/").pop() ?? "Document"
      : file?.name ?? "Document";

  const getExtension = (value: string) =>
    value.split("?")[0].split(".").pop()?.toLowerCase() ?? "";

  const isImage =
    (file instanceof File && file.type.startsWith("image/")) ||
    (typeof file === "string" &&
      ["png", "jpg", "jpeg", "webp", "gif"].includes(getExtension(file)));

  const isPdf =
    (file instanceof File && file.type === "application/pdf") ||
    (typeof file === "string" && getExtension(file) === "pdf");

  /* ---------------- PAGE RESOLUTION ---------------- */

  const getFieldPage = useCallback(
    (fieldName?: string | null) => {
      if (!fieldName || !extraction) return null;

      const field = extraction.extracted_values?.find(
        (v) => v.field_name === fieldName
      );

      return field?.page_number ?? null;
    },
    [extraction]
  );

  // active page
  const activePage = getFieldPage(activeFieldName);

  // hover page (debounced)
  useEffect(() => {
  const nextPage = getFieldPage(hoveredFieldName);

  const t = setTimeout(() => {
    setHoverPage((prev) => (prev === nextPage ? prev : nextPage));
  }, 100);

  return () => clearTimeout(t);
  }, [hoveredFieldName, getFieldPage]);

  // reset manual when user clicks field
  useEffect(() => {
  if (hoveredFieldName || activeFieldName) {
    setManualPage(null);
  }
  }, [hoveredFieldName, activeFieldName]);

  // final page (single source of truth)
  const effectivePageNumber = useMemo(() => {
  if (manualPage !== null) return manualPage;

  // ✅ FIX: hover should take priority over active
  if (hoverPage !== null) return hoverPage;

  if (activePage !== null) return activePage;

  return 1;
  }, [manualPage, hoverPage, activePage]);

  const totalPages = extraction?.page_dimensions?.length || 1;

  /* ---------- File URL ---------- */

  useEffect(() => {
  // ✅ clear cache when file changes
  pageCache.current.clear();

  if (!file) {
    setFileUrl(null);
    return;
  }

  if (typeof file === "string") {
    setFileUrl(file);
    return;
  }

  const url = URL.createObjectURL(file);
  setFileUrl(url);

  return () => URL.revokeObjectURL(url);
  }, [file]);

  /* ---------- Unified Render Pipeline ---------- */

  useEffect(() => {
    if (!file || !fileUrl) return;

    let cancelled = false;

    const process = async () => {
      try {
        if (isPdf) {
        // ✅ check cache first
        if (pageCache.current.has(effectivePageNumber)) {
          const cached = pageCache.current.get(effectivePageNumber);

          setPageImageUrl(cached.imageUrl);
          setPageDims({
            width: cached.width,
            height: cached.height,
          });
          return;
        }

        const rendered = await renderPdfPageToImage(
          file as any,
          effectivePageNumber,
          2
        );

        // ✅ store in cache
        pageCache.current.set(effectivePageNumber, rendered);

        if (!cancelled) {
          setPageImageUrl(rendered.imageUrl);
          setPageDims({
            width: rendered.width,
            height: rendered.height,
          });
        }

        return;
      }
        if (isImage) {
          const img = new Image();
          img.onload = () => {
            if (!cancelled) {
              setPageImageUrl(fileUrl);
              setPageDims({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            }
          };
          img.src = fileUrl;
        }
      } catch (err) {
        console.error("Document render failed:", err);
      }
    };

    process();

    return () => {
      cancelled = true;
    };
  }, [file, fileUrl, isPdf, isImage, effectivePageNumber]); // ✅ UPDATED

  /* ---------- Page + OCR ---------- */

  const currentPageDims = useMemo(() => {
    if (!extraction?.page_dimensions?.length) return null;
    return (
      extraction.page_dimensions.find(
        (p) => Number(p.page_number) === effectivePageNumber
      ) ?? null
    );
  }, [extraction, effectivePageNumber]);

  const currentPageLines = useMemo(() => {
    const rawLines = extraction?.ocr_lines || [];
    return rawLines.filter((l) => {
      const itemPage = Number(
        l.page_number || (l as any).pageNumber || 1
      );
      return itemPage === effectivePageNumber;
    });
  }, [extraction, effectivePageNumber]);

  const currentPageWords = useMemo(() => {
    const rawWords = extraction?.ocr_words || [];
    return rawWords.filter((w) => {
      const itemPage = Number(
        w.page_number || (w as any).pageNumber || 1
      );
      return itemPage === effectivePageNumber;
    });
  }, [extraction, effectivePageNumber]);

  const resolveBoxes = (fieldName: string | null | undefined) => {
    if (!fieldName || !extraction) return [];

    const ev = extraction.extracted_values?.find(
      (v) => v.field_name === fieldName
    );

    if (!ev || !ev.bounding_box) return [];
    if (Number(ev.page_number || 1) !== effectivePageNumber) return [];

    return Array.isArray(ev.bounding_box)
      ? ev.bounding_box
      : [ev.bounding_box];
  };

  const hoverBoxes = useMemo(
    () => resolveBoxes(hoveredFieldName),
    [hoveredFieldName, extraction, effectivePageNumber]
  );

  const focusBoxes = useMemo(
    () => resolveBoxes(activeFieldName),
    [activeFieldName, extraction, effectivePageNumber]
  );

  /* ---------- Render ---------- */

  if (!file) {
    return null;
  }

  return (
    <div className="h-full rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
        <h3 className="text-sm font-semibold">Document Preview</h3>

        {/* ✅ PAGINATION (UI unchanged style) */}
        <div className="flex items-center gap-2">
          <button
            disabled={effectivePageNumber <= 1}
            onClick={() =>
              setManualPage((p) => (p ?? effectivePageNumber) - 1)
            }
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-xs">
            Page {effectivePageNumber} / {totalPages}
          </span>

          <button
            disabled={effectivePageNumber >= totalPages}
            onClick={() =>
              setManualPage((p) => (p ?? effectivePageNumber) + 1)
            }
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="h-[calc(100%-52px)] bg-muted/10">
        {pageImageUrl && pageDims && currentPageDims && (
          <SelectableDocPage
            pageImageUrl={pageImageUrl}
            page={currentPageDims}
            lines={currentPageLines}
            words={currentPageWords}
            renderedWidth={pageDims?.width}
            renderedHeight={pageDims?.height}
            highlightBoxes={hoverBoxes}
            focusBoxes={focusBoxes}
            scrollToken={scrollToken}
          />
        )}
      </div>
    </div>
  );
}