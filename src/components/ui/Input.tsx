import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Left side adornment - icon or text */
  startAdornment?: React.ReactNode;
  /** Right side adornment - icon or text */
  endAdornment?: React.ReactNode;
  /** For using masked input components like react-imask */
  inputComponent?: React.ElementType;
  /** Props passed to the mask input component */
  inputProps?: Record<string, any>;
  /** Wrapper classname */
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  type,
  startAdornment,
  endAdornment,
  inputComponent: InputComponent,
  inputProps,
  wrapperClassName,
  ...props
}, ref) => {
  // If using a custom input component like IMaskInput
  if (InputComponent) {
    return (
      <div className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
        "ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        startAdornment && "pl-9",
        endAdornment && "pr-9",
        wrapperClassName
      )}>
        {startAdornment && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            {startAdornment}
          </div>
        )}
        
        <InputComponent
          {...inputProps}
          {...props}
          ref={ref}
          className={cn(
            "flex h-full w-full bg-transparent p-0 border-0 outline-none focus:ring-0",
            props.disabled && "cursor-not-allowed opacity-50",
            className
          )}
        />
        
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
  
  // Standard input with optional adornments
  return (
    <div className={cn(
      "relative flex items-center",
      wrapperClassName
    )}>
      {startAdornment && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
          {startAdornment}
        </div>
      )}
      
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
          "ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          startAdornment && "pl-9",
          endAdornment && "pr-9",
          className
        )}
        ref={ref}
        {...props}
      />
      
      {endAdornment && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
          {endAdornment}
        </div>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input }; 