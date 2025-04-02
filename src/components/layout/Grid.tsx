import * as React from "react";
import { cn } from "../../utils/cn";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns on different screen sizes */
  cols?: {
    /** Default column count */
    xs?: number;
    /** Small screens (640px+) */
    sm?: number;
    /** Medium screens (768px+) */
    md?: number;
    /** Large screens (1024px+) */
    lg?: number;
    /** Extra large screens (1280px+) */
    xl?: number;
    /** 2XL screens (1536px+) */
    "2xl"?: number;
  };
  /** Gap between grid items */
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  /** ID for testing */
  "data-testid"?: string;
}

/**
 * Responsive grid layout component
 * 
 * @example
 * ```tsx
 * <Grid cols={{ xs: 1, md: 2, lg: 3 }} gap="md">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </Grid>
 * ```
 */
export function Grid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = "md",
  "data-testid": testId,
  ...props
}: GridProps) {
  const getColumnsClasses = () => {
    const classes: string[] = [];
    
    if (cols.xs) {
      classes.push(`grid-cols-${cols.xs}`);
    }
    
    if (cols.sm) {
      classes.push(`sm:grid-cols-${cols.sm}`);
    }
    
    if (cols.md) {
      classes.push(`md:grid-cols-${cols.md}`);
    }
    
    if (cols.lg) {
      classes.push(`lg:grid-cols-${cols.lg}`);
    }
    
    if (cols.xl) {
      classes.push(`xl:grid-cols-${cols.xl}`);
    }
    
    if (cols["2xl"]) {
      classes.push(`2xl:grid-cols-${cols["2xl"]}`);
    }
    
    return classes.join(" ");
  };
  
  const getGapClass = () => {
    switch (gap) {
      case "none": return "gap-0";
      case "sm": return "gap-2";
      case "md": return "gap-4";
      case "lg": return "gap-6";
      case "xl": return "gap-8";
      default: return "gap-4";
    }
  };
  
  return (
    <div
      className={cn("grid", getColumnsClasses(), getGapClass(), className)}
      data-testid={testId}
      {...props}
    >
      {children}
    </div>
  );
}

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column span on different screen sizes */
  span?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  /** Starting column on different screen sizes */
  start?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  /** ID for testing */
  "data-testid"?: string;
}

/**
 * Grid item that can be positioned and sized within a Grid
 * 
 * @example
 * ```tsx
 * <Grid>
 *   <GridItem span={{ xs: 1, md: 2 }}>
 *     Wide item on medium screens
 *   </GridItem>
 * </Grid>
 * ```
 */
export function GridItem({
  children,
  className,
  span,
  start,
  "data-testid": testId,
  ...props
}: GridItemProps) {
  const getSpanClasses = () => {
    if (!span) return "";
    
    const classes: string[] = [];
    
    if (span.xs) {
      classes.push(`col-span-${span.xs}`);
    }
    
    if (span.sm) {
      classes.push(`sm:col-span-${span.sm}`);
    }
    
    if (span.md) {
      classes.push(`md:col-span-${span.md}`);
    }
    
    if (span.lg) {
      classes.push(`lg:col-span-${span.lg}`);
    }
    
    if (span.xl) {
      classes.push(`xl:col-span-${span.xl}`);
    }
    
    if (span["2xl"]) {
      classes.push(`2xl:col-span-${span["2xl"]}`);
    }
    
    return classes.join(" ");
  };
  
  const getStartClasses = () => {
    if (!start) return "";
    
    const classes: string[] = [];
    
    if (start.xs) {
      classes.push(`col-start-${start.xs}`);
    }
    
    if (start.sm) {
      classes.push(`sm:col-start-${start.sm}`);
    }
    
    if (start.md) {
      classes.push(`md:col-start-${start.md}`);
    }
    
    if (start.lg) {
      classes.push(`lg:col-start-${start.lg}`);
    }
    
    if (start.xl) {
      classes.push(`xl:col-start-${start.xl}`);
    }
    
    if (start["2xl"]) {
      classes.push(`2xl:col-start-${start["2xl"]}`);
    }
    
    return classes.join(" ");
  };
  
  return (
    <div
      className={cn(getSpanClasses(), getStartClasses(), className)}
      data-testid={testId}
      {...props}
    >
      {children}
    </div>
  );
} 