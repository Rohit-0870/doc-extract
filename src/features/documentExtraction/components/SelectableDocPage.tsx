
import { useEffect, useMemo, useRef, useState } from "react";
import type { OcrWord, OcrLine, PageDimension, BoundingBox } from "@/features/documentExtraction/documentTypes";
import { ZoomIn, ZoomOut } from 'lucide-react'

type AnyBox = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function normalizeFromLines(lines: OcrLine[]): AnyBox[] {
  return lines
    .filter((l) => l.bounding_box && l.text?.trim())
    .map((l) => ({
      text: l.text.trim(),
      x: l.bounding_box!.x,
      y: l.bounding_box!.y,
      width: l.bounding_box!.width,
      height: l.bounding_box!.height,
    }));
}

function normalizeFromWords(words: OcrWord[]): AnyBox[] {
  return words
    .filter((w) => w.bounding_box && w.text?.trim())
    .map((w) => ({
      text: w.text.trim(),
      x: w.bounding_box!.x,
      y: w.bounding_box!.y,
      width: w.bounding_box!.width,
      height: w.bounding_box!.height,
    }));
}

export function SelectableDocPage({
  pageImageUrl,
  page,
  words,
  lines,
  renderedWidth,
  renderedHeight,
  debugBoxes = false,
  highlightBoxes = [],
  focusBoxes = [],
  scrollToken = 0,
}: {
  pageImageUrl: string;
  page: PageDimension;
  words?: OcrWord[];
  lines?: OcrLine[];
  renderedWidth?: number;
  renderedHeight?: number;
  debugBoxes?: boolean;
  highlightBoxes?: BoundingBox[];
  focusBoxes?: BoundingBox[];
  scrollToken?: number;
}) {
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isInitialZoomSet, setIsInitialZoomSet] = useState(false);

  
  const ppi = useMemo(() => {
  if (!page?.width || !renderedWidth) return 96;
  return renderedWidth / page.width;
  }, [page?.width, renderedWidth]);

  useEffect(() => {
    if (!scrollRef.current || !renderedWidth || isInitialZoomSet) return;
    const containerWidth = scrollRef.current.clientWidth - 40;
    const fitZoom = Number((containerWidth / renderedWidth).toFixed(2));
    setZoom(Math.min(1, fitZoom));
    setIsInitialZoomSet(true);
  }, [renderedWidth, isInitialZoomSet]);

  const displayWidth = (renderedWidth ?? (page.width * ppi)) * zoom;
  const displayHeight = (renderedHeight ?? (page.height * ppi)) * zoom;

  const boxes: AnyBox[] = useMemo(() => {
    if (lines && lines.length > 0) return normalizeFromLines(lines);
    if (words && words.length > 0) return normalizeFromWords(words);
    return [];
  }, [lines, words]);

  const scaleX = renderedWidth / page.width;
  const scaleY = renderedHeight / page.height;

  useEffect(() => {
  if (!focusBoxes || focusBoxes.length === 0 || !isInitialZoomSet) return;

  const first = focusBoxes[0];
  const el = scrollRef.current;
  if (!el) return;

  const PADDING = 16;

  const left = first.x * scaleX * zoom;
  const top = first.y * scaleY * zoom;
  const width = first.width * scaleX * zoom;
  const height = first.height * scaleY * zoom;

  const targetX = PADDING + left + width / 2;
  const targetY = PADDING + top + height / 2;

  const nextLeft = Math.max(0, targetX - el.clientWidth / 2);
  const nextTop = Math.max(0, targetY - el.clientHeight / 2);

  const timeoutId = setTimeout(() => {
    el.scrollTo({
      top: nextTop,
      left: nextLeft,
      behavior: "smooth",
    });
  }, 100);

  return () => clearTimeout(timeoutId);
}, [scrollToken, focusBoxes, scaleX, scaleY, zoom, isInitialZoomSet]);

  return (
    <div className="h-full w-full">
      {/* Toolbar */}
      <div className="flex justify-between items-center gap-2 px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex flex-direction-row items-center gap-2">
          <button
          className="px-2 py-1 rounded border border-border text-sm"
          onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
          >
            <ZoomOut size={15} className="text-muted-foreground"/>
          </button>
          <span className="text-xs text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            className="px-2 py-1 rounded border border-border text-sm"
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
          >
            <ZoomIn size={15} className="text-muted-foreground"/>
          </button>
        </div>
        {/* <div>
          <span className="ml-auto text-xs text-muted-foreground">
          {lines?.length ? "Azure OCR Lines ✅" : "OCR Words (fallback) ⚠️"}
          </span>
        </div> */}
      </div>

      {/* Page container */}
      <div
        ref={scrollRef}
        className="overflow-auto h-[calc(100%-42px)] bg-muted/10 p-4 mx-auto transition-all duration-200"
      >
        <div
          style={{
            position: "relative",
            width: displayWidth,
            height: displayHeight,
          }}
        >
          <img
            src={pageImageUrl}
            alt="Document Page"
            draggable={false}
            style={{
              width: displayWidth,
              height: displayHeight,
              display: "block",
              userSelect: "none",
            }}
          />

          {/* Focus highlight (Using PPI) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: displayWidth,
              height: displayHeight,
              pointerEvents: "none",
            }}
          >
            {focusBoxes.map((b, i) => {
              const left = b.x * scaleX * zoom;
              const top = b.y * scaleY * zoom;
              const width = b.width * scaleX * zoom;
              const height = b.height * scaleY * zoom;

              return (
                <div
                  key={`focus-${i}`}
                  style={{
                    position: "absolute",
                    left: left - 2,
                    top: top - 2,
                    width: width + 4,
                    height: height + 4,
                    background: "rgba(255, 235, 59, 0.35)",
                    borderRadius: 4,
                    border: "2px solid rgba(255, 215, 0, 0.8)",
                    pointerEvents: "none",
                  }}
                />
              );
            })}
          </div>

          {/* Hover highlight (Using PPI) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: displayWidth,
              height: displayHeight,
              pointerEvents: "none",
            }}
          >
            {highlightBoxes.map((b, i) => {
              const left = b.x * scaleX * zoom;
              const top = b.y * scaleY * zoom;
              const width = b.width * scaleX * zoom;
              const height = b.height * scaleY * zoom;

              return (
                <div
                  key={`hover-${i}`}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width,
                    height,
                    background: "rgba(255, 235, 59, 0.25)",
                    borderRadius: 4,
                    boxShadow: "0 0 0 1px rgba(255, 235, 59, 0.45)",
                  }}
                />
              );
            })}
          </div>

          {/* Selectable overlay (Using PPI) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: displayWidth,
              height: displayHeight,
              zIndex: 50,
              pointerEvents: "auto",
            }}
          >
            {boxes.map((b, i) => {
              const left = b.x * scaleX * zoom;
              const top = b.y * scaleY * zoom;
              const width = b.width * scaleX * zoom;
              const height = b.height * scaleY * zoom;

              const safeHeight = Math.max(1, height * 0.85);
              const safeTop = top + (height - safeHeight) / 2;

              return (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left,
                    top: safeTop,
                    width,
                    height: safeHeight,
                    fontSize: Math.max(10, safeHeight * 0.95),
                    lineHeight: `${safeHeight}px`,
                    whiteSpace: "pre",
                    color: "transparent",
                    userSelect: "text",
                    pointerEvents: "auto",
                    background: debugBoxes ? "rgba(0,180,255,0.12)" : "transparent",
                    outline: debugBoxes ? "1px dashed rgba(0,180,255,0.65)" : "none",
                  }}
                >
                  {b.text}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}