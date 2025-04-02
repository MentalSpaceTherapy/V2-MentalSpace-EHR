import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"
import { forwardRef, useState } from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { FormProps, FormControlProps } from "./types"

const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      className,
      children,
      onSubmit,
      defaultValues,
      validate,
      resetOnSubmit = false,
      testId,
      ...props
    },
    ref
  ) => {
    const [values, setValues] = useState<Record<string, any>>(defaultValues || {})
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      // Validate form values if validate function is provided
      let formErrors: Record<string, string> = {}
      if (validate) {
        formErrors = validate(values)
        setErrors(formErrors)
      }

      // If there are no errors, call onSubmit
      if (Object.keys(formErrors).length === 0 && onSubmit) {
        onSubmit(values)

        // Reset form if resetOnSubmit is true
        if (resetOnSubmit) {
          setValues(defaultValues || {})
          setTouched({})
          
          // Reset form element
          const formElement = e.target as HTMLFormElement
          formElement.reset()
        }
      }
    }

    // Create a context value to share with FormControl components
    const formContextValue = {
      values,
      errors,
      touched,
      setValues: (name: string, value: any) => {
        setValues((prev) => ({ ...prev, [name]: value }))
      },
      setTouched: (name: string) => {
        setTouched((prev) => ({ ...prev, [name]: true }))
      },
    }

    return (
      <FormContext.Provider value={formContextValue}>
        <form
          ref={ref}
          className={cn("space-y-4", className)}
          onSubmit={handleSubmit}
          data-testid={testId}
          {...props}
        >
          {typeof children === 'function'
            ? children(formContextValue)
            : children}
        </form>
      </FormContext.Provider>
    )
  }
)
Form.displayName = "Form"

// Create a context for form state
interface FormContextValue {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  setValues: (name: string, value: any) => void
  setTouched: (name: string) => void
}

const FormContext = React.createContext<FormContextValue | undefined>(undefined)

// Hook to use form context
export const useFormContext = () => {
  const context = React.useContext(FormContext)
  if (!context) {
    throw new Error("useFormContext must be used within a Form component")
  }
  return context
}

/**
 * FormControl component
 * 
 * A container for form elements with label and error message handling.
 * 
 * @example
 * ```tsx
 * <FormControl label="Email" isRequired>
 *   <Input name="email" type="email" />
 * </FormControl>
 * ```
 */
export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  (
    {
      className,
      children,
      label,
      helperText,
      errorText,
      isRequired,
      isDisabled,
      isInvalid,
      isReadOnly,
      testId,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for the label
    const id = React.useId()

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1.5", className)}
        data-testid={testId}
        {...props}
      >
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "text-sm font-medium text-neutral-700",
              isRequired && "after:ml-0.5 after:text-error-500 after:content-['*']",
              isDisabled && "text-neutral-400"
            )}
          >
            {label}
          </label>
        )}

        {/* Clone children with additional props */}
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child

          return React.cloneElement(child as React.ReactElement<any>, {
            id,
            disabled: isDisabled,
            "aria-invalid": isInvalid,
            "aria-required": isRequired,
            "aria-readonly": isReadOnly,
          })
        })}

        {/* Helper or error text */}
        {(helperText || errorText) && (
          <div className="space-y-1">
            {helperText && !errorText && (
              <p className="text-xs text-neutral-500">{helperText}</p>
            )}
            {errorText && (
              <p className="text-xs text-error-500">{errorText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)
FormControl.displayName = "FormControl"

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
)

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
})
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
FormMessage.displayName = "FormMessage"

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
