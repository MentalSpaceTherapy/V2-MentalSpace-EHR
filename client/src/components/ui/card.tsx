import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { CardProps } from "./types";
import { useTheme } from "./ThemeProvider";

/**
 * Card component
 * 
 * A versatile container component for grouping related content and actions.
 * Supports various style options, headers, and footers.
 * 
 * @example
 * ```tsx
 * <Card title="User Profile" subtitle="Personal information">
 *   <p>Card content goes here</p>
 * </Card>
 * 
 * <Card 
 *   title="Settings" 
 *   headerAction={<Button variant="ghost" size="sm">Edit</Button>}
 *   footer={<Button>Save Changes</Button>}
 *   isHoverable
 * >
 *   <p>Card content goes here</p>
 * </Card>
 * ```
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      title,
      subtitle,
      headerAction,
      footer,
      children,
      borderRadius = "lg",
      shadow = "md",
      isHoverable = false,
      padding = "md",
      border = true,
      maxWidth,
      testId,
      ...props
    },
    ref
  ) => {
    // Mapping shadow options to Tailwind classes
    const shadowMap = {
      none: "",
      sm: "shadow-sm",
      md: "shadow",
      lg: "shadow-md",
      xl: "shadow-lg",
      "2xl": "shadow-xl",
      inner: "shadow-inner",
    };

    // Mapping border radius options to Tailwind classes
    const radiusMap = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
      full: "rounded-full",
    };

    // Mapping padding options to Tailwind classes
    const paddingMap = {
      none: "p-0",
      sm: "p-3",
      md: "p-5",
      lg: "p-7",
    };

    // Has header if title, subtitle, or headerAction is provided
    const hasHeader = title || subtitle || headerAction;

    return (
      <div
        ref={ref}
        data-testid={testId}
        className={cn(
          // Base styles
          "bg-white overflow-hidden",
          // Border
          border && "border border-neutral-200",
          // Shadow and radius from props
          shadowMap[shadow],
          radiusMap[borderRadius],
          // Hover effect
          isHoverable && "transition-shadow hover:shadow-lg",
          className
        )}
        style={{ maxWidth: maxWidth || undefined }}
        {...props}
      >
        {/* Card Header */}
        {hasHeader && (
          <div className="flex justify-between items-start border-b border-neutral-200 px-5 py-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-neutral-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        )}

        {/* Card Body */}
        <div className={!hasHeader && !footer ? paddingMap[padding] : 'px-5 py-4'}>
          {children}
        </div>

        {/* Card Footer */}
        {footer && (
          <div className="border-t border-neutral-200 px-5 py-4 bg-neutral-50">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
