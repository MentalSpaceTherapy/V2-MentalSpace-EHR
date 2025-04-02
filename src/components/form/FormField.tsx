import * as React from "react";
import { Controller, useFormContext, get } from "react-hook-form";
import { cn } from "../../utils/cn";

export interface FormFieldProps {
  /** Field name, should match the schema */
  name: string;
  /** Field label */
  label?: string;
  /** Help text to display below the field */
  helpText?: string;
  /** Whether the field is required */
  isRequired?: boolean;
  /** Whether the field is disabled */
  isDisabled?: boolean;
  /** Whether the field is read-only */
  isReadOnly?: boolean;
  /** Additional classes to apply to the container */
  className?: string;
  /** Child input element */
  children: React.ReactElement;
  /** ID for testing */
  "data-testid"?: string;
}

/**
 * FormField component for use with Form component
 * 
 * @example
 * ```tsx
 * <FormField name="email" label="Email Address" isRequired>
 *   <Input type="email" />
 * </FormField>
 * ```
 */
export function FormField({
  name,
  label,
  helpText,
  isRequired,
  isDisabled,
  isReadOnly,
  className,
  children,
  "data-testid": testId,
}: FormFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Extract error for this field
  const error = get(errors, name);
  const errorMessage = error?.message as string | undefined;

  // Generate unique ID for associating label with input
  const id = React.useId();
  const fieldId = `${id}-${name}`;

  return (
    <div
      className={cn("flex flex-col space-y-1.5", className)}
      data-testid={testId}
    >
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium text-gray-700",
            isRequired && "after:ml-0.5 after:text-red-500 after:content-['*']",
            isDisabled && "text-gray-400 cursor-not-allowed"
          )}
        >
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          // Clone the child element with field props
          const childProps = {
            id: fieldId,
            ...field,
            disabled: isDisabled,
            readOnly: isReadOnly,
            "aria-invalid": !!error,
            "aria-required": isRequired,
            "aria-describedby": helpText ? `${fieldId}-help` : undefined,
            className: cn(
              children.props.className,
              error && "border-red-500 focus:ring-red-500"
            ),
          };

          return React.cloneElement(children, childProps);
        }}
      />

      {/* Error message or help text */}
      {(errorMessage || helpText) && (
        <div className="mt-1">
          {errorMessage ? (
            <p className="text-sm text-red-600" data-testid={`${name}-error`}>{errorMessage}</p>
          ) : helpText ? (
            <p 
              id={`${fieldId}-help`} 
              className="text-sm text-gray-500"
            >
              {helpText}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
} 