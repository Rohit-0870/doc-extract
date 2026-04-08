import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));

interface SmartTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

const SmartTooltip: React.FC<SmartTooltipProps> = ({
  children,
  content,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);

    return () => observer.disconnect();
  }, [children]);

  return (
    <TooltipPrimitive.Root delayDuration={350}>
      <TooltipPrimitive.Trigger asChild>
        <div
          ref={ref}
          className="truncate whitespace-nowrap overflow-hidden"
        >
          {children}
        </div>
      </TooltipPrimitive.Trigger>

      {isTruncated && (
        <TooltipPrimitive.Content
          sideOffset={4}
          className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md"
        >
          {content}
        </TooltipPrimitive.Content>
      )}
    </TooltipPrimitive.Root>
  );
};

const SmartMultilineTooltip = ({ children, content }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);

    return () => observer.disconnect();
  }, [children]);

  return (
  <Tooltip>
    <TooltipTrigger asChild>
      <div
        ref={ref}
        className="line-clamp-2 overflow-hidden text-sm"
      >
        {children}
      </div>
    </TooltipTrigger>

    {isTruncated && (
      <TooltipPrimitive.Portal>
        <TooltipContent className="max-w-[min(700px,80vw)] whitespace-pre-wrap break-words">
          {content}
        </TooltipContent>
      </TooltipPrimitive.Portal>
    )}
  </Tooltip>
);
};


TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, SmartTooltip, SmartMultilineTooltip };
