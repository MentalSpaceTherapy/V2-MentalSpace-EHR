import * as React from "react";
import { Input } from "../ui/Input";
import { FormField, FormFieldProps } from "./FormField";
import { IMaskInput } from "react-imask";

type InputFieldProps = Omit<FormFieldProps, "children"> & React.ComponentPropsWithoutRef<typeof Input>;

/**
 * Input field with label and validation
 */
export function InputField(props: InputFieldProps) {
  const { type = "text", ...rest } = props;
  return (
    <FormField {...rest}>
      <Input type={type} />
    </FormField>
  );
}

/**
 * Email input field with validation
 */
export function EmailField(props: Omit<InputFieldProps, "type">) {
  return <InputField type="email" {...props} />;
}

/**
 * Password input field with validation
 */
export function PasswordField(props: Omit<InputFieldProps, "type">) {
  return <InputField type="password" {...props} />;
}

/**
 * Phone number input field with formatting
 */
export function PhoneField(props: Omit<InputFieldProps, "type" | "inputComponent">) {
  return (
    <FormField {...props}>
      <Input
        type="tel"
        inputComponent={IMaskInput}
        inputProps={{
          mask: "(000) 000-0000",
          unmask: true,
          placeholderChar: "_",
          lazy: false,
        }}
        placeholder="(555) 555-5555"
      />
    </FormField>
  );
}

/**
 * SSN input field with formatting and security
 */
export function SSNField(props: Omit<InputFieldProps, "type" | "inputComponent">) {
  return (
    <FormField {...props}>
      <Input
        type="text"
        inputComponent={IMaskInput}
        inputProps={{
          mask: "000-00-0000",
          unmask: true,
          placeholderChar: "_",
          lazy: false,
        }}
        placeholder="XXX-XX-XXXX"
      />
    </FormField>
  );
}

/**
 * Date input field with date picker
 */
export function DateField(props: Omit<InputFieldProps, "type">) {
  return <InputField type="date" {...props} />;
}

/**
 * Currency input field with formatting
 */
export function CurrencyField(props: Omit<InputFieldProps, "type" | "inputComponent" | "startAdornment">) {
  return (
    <FormField {...props}>
      <Input
        type="text"
        inputComponent={IMaskInput}
        inputProps={{
          mask: Number,
          scale: 2,
          signed: false,
          thousandsSeparator: ",",
          padFractionalZeros: true,
          normalizeZeros: true,
          radix: ".",
          mapToRadix: ["."],
        }}
        startAdornment="$"
      />
    </FormField>
  );
}

/**
 * Healthcare identifier field (NPI, etc.)
 */
export function IdentifierField(props: Omit<InputFieldProps, "type" | "inputComponent">) {
  const { pattern, ...rest } = props;
  return (
    <FormField {...rest}>
      <Input 
        type="text"
        pattern={pattern || "[0-9]*"}
      />
    </FormField>
  );
} 