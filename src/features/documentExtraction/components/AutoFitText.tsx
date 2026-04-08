import { useLayoutEffect, useRef } from "react";

type AutoFitTextProps = {
  text: string;
  maxFontPx?: number;
  minFontPx?: number;
};

export function AutoFitText({
  text,
  maxFontPx = 14,
  minFontPx = 8,
}: AutoFitTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const p = textRef.current;
    if (!container || !p) return;

    let raf = 0;

    const fit = () => {
      let size = maxFontPx;

      p.style.fontSize = `${size}px`;
      p.style.lineHeight = `${Math.max(Math.round(size * 1.1), 12)}px`;

      const containerHeight = container.clientHeight;

      while (size > minFontPx && p.scrollHeight > containerHeight) {
        size -= 1;
        p.style.fontSize = `${size}px`;
        p.style.lineHeight = `${Math.max(Math.round(size * 1.1), 12)}px`;
      }
    };

    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };

    run();

    const ro = new ResizeObserver(run);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [text, maxFontPx, minFontPx]);

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <p
        ref={textRef}
        className="font-normal text-foreground whitespace-normal break-words leading-tight"
        style={{ wordBreak: "break-word" }}
      >
        {text}
      </p>
    </div>
  );
}
