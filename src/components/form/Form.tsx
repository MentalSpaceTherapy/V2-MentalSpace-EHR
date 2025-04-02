import * as React from "react";
import { useForm, FormProvider, UseFormProps, SubmitHandler, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export interface FormProps<TFormValues extends FieldValues, Schema extends z.ZodType<TFormValues>> {
  /** The form schema for validation */
  schema: Schema;
  /** Default values for the form */
  defaultValues?: UseFormProps<TFormValues>["defaultValues"];
  /** Children render prop or React nodes */
  children: React.ReactNode | ((props: { isSubmitting: boolean; isValid: boolean }) => React.ReactNode);
  /** Called when the form is submitted and validation passes */
  onSubmit: SubmitHandler<TFormValues>;
  /** Additional props to pass to the form element */
  className?: string;
  /** Called when form values change */
  onValuesChange?: (values: TFormValues) => void;
  /** ID for testing */
  "data-testid"?: string;
}

/**
 * Form component that integrates Zod validation with React Hook Form
 * 
 * @example
 * ```tsx
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 * 
 * <Form schema={schema} onSubmit={handleSubmit}>
 *   {({ isSubmitting }) => (
 *     <>
 *       <FormField name="email" label="Email">
 *         <Input />
 *       </FormField>
 *       <Button type="submit" isLoading={isSubmitting}>
 *         Submit
 *       </Button>
 *     </>
 *   )}
 * </Form>
 * ```
 */
export function Form<
  TFormValues extends FieldValues,
  Schema extends z.ZodType<TFormValues>
>({
  schema,
  defaultValues,
  children,
  onSubmit,
  className,
  onValuesChange,
  "data-testid": testId,
  ...props
}: FormProps<TFormValues, Schema>) {
  const methods = useForm<TFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  // Subscribe to form value changes
  React.useEffect(() => {
    if (onValuesChange) {
      const subscription = methods.watch((values) => {
        onValuesChange(values as TFormValues);
      });
      return () => subscription.unsubscribe();
    }
  }, [methods, onValuesChange]);

  return (
    <FormProvider {...methods}>
      <form
        className={className}
        onSubmit={methods.handleSubmit(onSubmit)}
        data-testid={testId}
        {...props}
      >
        {typeof children === "function"
          ? children({
              isSubmitting: methods.formState.isSubmitting,
              isValid: methods.formState.isValid,
            })
          : children}
      </form>
    </FormProvider>
  );
} 