import * as React from "react";
import { cn } from "../../utils/cn";

export interface SplitPanelProps {
  /** Left panel content */
  left: React.ReactNode;
  /** Right panel content */
  right: React.ReactNode;
  /** Orientation of the split */
  orientation?: "horizontal" | "vertical";
  /** Direction when in vertical orientation */
  direction?: "left-right" | "right-left";
  /** Ratio of the split (default is 1:1) */
  ratio?: "1:1" | "1:2" | "2:1" | "1:3" | "3:1" | "auto";
  /** Whether the left panel is collapsible */
  collapsibleLeft?: boolean;
  /** Whether the right panel is collapsible */
  collapsibleRight?: boolean;
  /** Class name for the container */
  className?: string;
  /** Class name for the left panel */
  leftClassName?: string;
  /** Class name for the right panel */
  rightClassName?: string;
  /** ID for testing */
  "data-testid"?: string;
}

/**
 * Split panel layout for two-panel UIs like list/detail views
 * 
 * @example
 * ```tsx
 * <SplitPanel
 *   left={<ClientList />}
 *   right={<ClientDetail />}
 *   ratio="1:2"
 *   collapsibleLeft
 * />
 * ```
 */
export function SplitPanel({
  left,
  right,
  orientation = "horizontal",
  direction = "left-right",
  ratio = "1:1",
  collapsibleLeft = false,
  collapsibleRight = false,
  className,
  leftClassName,
  rightClassName,
  "data-testid": testId,
}: SplitPanelProps) {
  const [leftCollapsed, setLeftCollapsed] = React.useState(false);
  const [rightCollapsed, setRightCollapsed] = React.useState(false);
  
  const getRatioClasses = () => {
    if (orientation === "vertical") {
      return "";
    }
    
    switch (ratio) {
      case "1:1":
        return "grid-cols-2";
      case "1:2":
        return "grid-cols-3 [&>*:first-child]:col-span-1 [&>*:last-child]:col-span-2";
      case "2:1":
        return "grid-cols-3 [&>*:first-child]:col-span-2 [&>*:last-child]:col-span-1";
      case "1:3":
        return "grid-cols-4 [&>*:first-child]:col-span-1 [&>*:last-child]:col-span-3";
      case "3:1":
        return "grid-cols-4 [&>*:first-child]:col-span-3 [&>*:last-child]:col-span-1";
      case "auto":
      default:
        return "grid-cols-[auto_1fr]";
    }
  };
  
  const toggleLeftCollapse = () => setLeftCollapsed(!leftCollapsed);
  const toggleRightCollapse = () => setRightCollapsed(!rightCollapsed);
  
  if (orientation === "vertical") {
    return (
      <div
        className={cn(
          "flex flex-col h-full",
          direction === "right-left" && "flex-col-reverse",
          className
        )}
        data-testid={testId}
      >
        <div
          className={cn(
            "relative",
            direction === "left-right" ? "border-b" : "border-t", 
            "border-gray-200",
            ratio === "1:1" && "flex-1",
            ratio === "1:2" && (
              direction === "left-right" ? "flex-1" : "flex-[2]"
            ),
            ratio === "2:1" && (
              direction === "left-right" ? "flex-[2]" : "flex-1"
            ),
            ratio === "1:3" && (
              direction === "left-right" ? "flex-1" : "flex-[3]"
            ),
            ratio === "3:1" && (
              direction === "left-right" ? "flex-1" : "flex-[3]"
            ),
            leftCollapsed && "h-10 flex-none overflow-hidden",
            leftClassName
          )}
        >
          {collapsibleLeft && (
            <button
              className="absolute right-2 top-2 z-10 p-1 rounded-full bg-white shadow hover:bg-gray-100"
              onClick={toggleLeftCollapse}
              aria-label={leftCollapsed ? "Expand panel" : "Collapse panel"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                {leftCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L9 17.25m0 0L3 12m6 5.25h9.75" />
                )}
              </svg>
            </button>
          )}
          
          {direction === "left-right" ? left : right}
        </div>
        
        <div
          className={cn(
            "relative",
            ratio === "1:1" && "flex-1",
            ratio === "1:2" && (
              direction === "left-right" ? "flex-[2]" : "flex-1"
            ),
            ratio === "2:1" && (
              direction === "left-right" ? "flex-1" : "flex-[2]"
            ),
            ratio === "1:3" && (
              direction === "left-right" ? "flex-[3]" : "flex-1"
            ),
            ratio === "3:1" && (
              direction === "left-right" ? "flex-1" : "flex-[3]"
            ),
            rightCollapsed && "h-10 flex-none overflow-hidden",
            rightClassName
          )}
        >
          {collapsibleRight && (
            <button
              className="absolute right-2 top-2 z-10 p-1 rounded-full bg-white shadow hover:bg-gray-100"
              onClick={toggleRightCollapse}
              aria-label={rightCollapsed ? "Expand panel" : "Collapse panel"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                {rightCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L9 17.25m0 0L3 12m6 5.25h9.75" />
                )}
              </svg>
            </button>
          )}
          
          {direction === "left-right" ? right : left}
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={cn(
        "grid h-full gap-4",
        getRatioClasses(),
        direction === "right-left" && "flex-row-reverse",
        className
      )}
      data-testid={testId}
    >
      <div
        className={cn(
          "relative",
          direction === "left-right" ? "border-r" : "border-l", 
          "border-gray-200",
          leftCollapsed && "w-10 overflow-hidden",
          leftClassName
        )}
      >
        {collapsibleLeft && (
          <button
            className="absolute right-2 top-2 z-10 p-1 rounded-full bg-white shadow hover:bg-gray-100"
            onClick={toggleLeftCollapse}
            aria-label={leftCollapsed ? "Expand panel" : "Collapse panel"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              {leftCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L9 17.25m0 0L3 12m6 5.25h9.75" />
              )}
            </svg>
          </button>
        )}
        
        {direction === "left-right" ? left : right}
      </div>
      
      <div
        className={cn(
          "relative",
          rightCollapsed && "w-10 overflow-hidden",
          rightClassName
        )}
      >
        {collapsibleRight && (
          <button
            className="absolute right-2 top-2 z-10 p-1 rounded-full bg-white shadow hover:bg-gray-100"
            onClick={toggleRightCollapse}
            aria-label={rightCollapsed ? "Expand panel" : "Collapse panel"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              {rightCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L9 17.25m0 0L3 12m6 5.25h9.75" />
              )}
            </svg>
          </button>
        )}
        
        {direction === "left-right" ? right : left}
      </div>
    </div>
  );
} 