import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";
import { InputProps } from "./types";

const statusStyles = {
  default: {
    input: "",
    label: "",
    helper: "text-neutral-500",
  },
  success: {
    input: "border-success-500 focus:border-success-500 focus:ring-success-500/20",
    label: "text-success-600",
    helper: "text-success-600",
  },
  error: {
    input: "border-error-500 focus:border-error-500 focus:ring-error-500/20",
    label: "text-error-600",
    helper: "text-error-600",
  },
  warning: {
    input: "border-warning-500 focus:border-warning-500 focus:ring-warning-500/20",
    label: "text-warning-600",
    helper: "text-warning-600",
  },
};

const sizeStyles = {
  xs: "h-6 px-2 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-base",
  lg: "h-12 px-5 text-lg",
  xl: "h-14 px-6 text-xl",
};

/**
 * Input component
 * 
 * A fully-featured input component with label, helper text, and validation states.
 * Supports leading and trailing icons, as well as different sizes.
 * 
 * @example
 * ```tsx
 * <Input label="Email" placeholder="Enter your email" />
 * <Input 
 *   label="Password" 
 *   type="password" 
 *   status="error" 
 *   statusMessage="Password is required" 
 * />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      helperText,
      status = "default",
      statusMessage,
      size = "md",
      isFullWidth = true,
      leadingIcon,
      trailingIcon,
      isDisabled = false,
      testId,
      required,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID for the input if not provided
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const helperTextId = `helper-${inputId}`;
    const statusMessageId = `status-${inputId}`;

    return (
      <div className={cn("flex flex-col gap-1.5", isFullWidth ? "w-full" : "max-w-sm")}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium text-neutral-700",
              required && "after:ml-0.5 after:text-error-500 after:content-['*']",
              statusStyles[status].label
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leadingIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
              {leadingIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            data-testid={testId}
            disabled={isDisabled}
            className={cn(
              // Base styles
              "block rounded-md border border-neutral-300 bg-white text-neutral-900 shadow-sm",
              "focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20",
              "placeholder:text-neutral-400",
              "disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500",
              // Status styles
              statusStyles[status].input,
              // Size styles
              sizeStyles[size],
              // Icon padding adjustments
              leadingIcon && "pl-10",
              trailingIcon && "pr-10",
              // Width
              isFullWidth ? "w-full" : "w-auto",
              // Custom classNames
              className
            )}
            aria-describedby={
              helperText ? helperTextId : statusMessage ? statusMessageId : undefined
            }
            required={required}
            {...props}
          />

          {trailingIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-500">
              {trailingIcon}
            </div>
          )}
        </div>

        {(helperText || statusMessage) && (
          <div className="space-y-1">
            {helperText && (
              <p
                id={helperTextId}
                className={cn("text-xs", statusStyles[status].helper)}
              >
                {helperText}
              </p>
            )}
            {statusMessage && (
              <p
                id={statusMessageId}
                className={cn("text-xs", statusStyles[status].helper)}
              >
                {statusMessage}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
