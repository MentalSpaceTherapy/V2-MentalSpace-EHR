import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { ButtonProps } from "./types"
import { useTheme } from "./ThemeProvider"
import { Spinner } from "./Spinner"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "",
        outline: "border",
        ghost: "",
        link: "underline-offset-4 hover:underline",
      },
      color: {
        primary: "",
        secondary: "",
        success: "",
        warning: "",
        error: "",
        neutral: "",
      },
      size: {
        xs: "h-6 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl",
      },
      isFullWidth: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      // Solid variants
      { variant: "solid", color: "primary", className: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700" },
      { variant: "solid", color: "secondary", className: "bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700" },
      { variant: "solid", color: "success", className: "bg-success-500 text-white hover:bg-success-600 active:bg-success-700" },
      { variant: "solid", color: "warning", className: "bg-warning-500 text-white hover:bg-warning-600 active:bg-warning-700" },
      { variant: "solid", color: "error", className: "bg-error-500 text-white hover:bg-error-600 active:bg-error-700" },
      { variant: "solid", color: "neutral", className: "bg-neutral-700 text-white hover:bg-neutral-800 active:bg-neutral-900" },
      
      // Outline variants
      { variant: "outline", color: "primary", className: "border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100" },
      { variant: "outline", color: "secondary", className: "border-secondary-500 text-secondary-500 hover:bg-secondary-50 active:bg-secondary-100" },
      { variant: "outline", color: "success", className: "border-success-500 text-success-500 hover:bg-success-50 active:bg-success-100" },
      { variant: "outline", color: "warning", className: "border-warning-500 text-warning-500 hover:bg-warning-50 active:bg-warning-100" },
      { variant: "outline", color: "error", className: "border-error-500 text-error-500 hover:bg-error-50 active:bg-error-100" },
      { variant: "outline", color: "neutral", className: "border-neutral-500 text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100" },
      
      // Ghost variants
      { variant: "ghost", color: "primary", className: "text-primary-500 hover:bg-primary-50 active:bg-primary-100" },
      { variant: "ghost", color: "secondary", className: "text-secondary-500 hover:bg-secondary-50 active:bg-secondary-100" },
      { variant: "ghost", color: "success", className: "text-success-500 hover:bg-success-50 active:bg-success-100" },
      { variant: "ghost", color: "warning", className: "text-warning-500 hover:bg-warning-50 active:bg-warning-100" },
      { variant: "ghost", color: "error", className: "text-error-500 hover:bg-error-50 active:bg-error-100" },
      { variant: "ghost", color: "neutral", className: "text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100" },
      
      // Link variants
      { variant: "link", color: "primary", className: "text-primary-500 hover:text-primary-600" },
      { variant: "link", color: "secondary", className: "text-secondary-500 hover:text-secondary-600" },
      { variant: "link", color: "success", className: "text-success-500 hover:text-success-600" },
      { variant: "link", color: "warning", className: "text-warning-500 hover:text-warning-600" },
      { variant: "link", color: "error", className: "text-error-500 hover:text-error-600" },
      { variant: "link", color: "neutral", className: "text-neutral-700 hover:text-neutral-800" },
    ],
    defaultVariants: {
      variant: "solid",
      color: "primary",
      size: "md",
      isFullWidth: false,
    },
  }
)

/**
 * Button component
 * 
 * A versatile button component with multiple variants, sizes, and states.
 * Supports icons, loading state, and custom styling.
 * 
 * @example
 * ```tsx
 * <Button color="primary" size="md">Click me</Button>
 * <Button variant="outline" isLoading>Loading</Button>
 * <Button leadingIcon={<PlusIcon />}>Add item</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = "solid",
    color = "primary",
    size = "md",
    isFullWidth = false,
    isLoading = false,
    loadingText,
    leadingIcon,
    trailingIcon,
    children,
    testId,
    ...props
  }, ref) => {
    // Convert props to format expected by our variant utility
    const variantProps = {
      variant,
      color,
      size,
      isFullWidth,
    }

    return (
      <button
        data-testid={testId}
        className={cn(buttonVariants(variantProps), className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <Spinner 
            size={size === 'xs' || size === 'sm' ? 'xs' : 'sm'} 
            color={color}
            className="mr-2"
          />
        )}
        {!isLoading && leadingIcon && (
          <span className="mr-2">{leadingIcon}</span>
        )}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && trailingIcon && (
          <span className="ml-2">{trailingIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { buttonVariants }
