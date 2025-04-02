import React from 'react';
import { cn } from '../../lib/utils';
import { SpinnerProps } from './types';

/**
 * Spinner component
 * 
 * A configurable loading spinner with different sizes and colors.
 * 
 * @example
 * ```tsx
 * <Spinner /> // Default spinner
 * <Spinner size="lg" color="primary" />
 * <Spinner label="Loading..." labelPosition="right" />
 * ```
 */
export const Spinner: React.FC<SpinnerProps> = ({
  className,
  size = 'md',
  color = 'primary',
  thickness = 2,
  speed = '0.75s',
  label,
  labelPosition = 'right',
  testId,
  ...props
}) => {
  // Size mappings
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-10 w-10',
  };

  // Color mappings
  const colorMap = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500',
    neutral: 'text-neutral-500',
  };

  // Position for label styles
  const labelPositionClasses = {
    top: 'flex-col-reverse items-center',
    right: 'flex-row items-center',
    bottom: 'flex-col items-center',
    left: 'flex-row-reverse items-center',
  };

  const spinnerStyles = cn(
    'inline-block animate-spin rounded-full border-current border-t-transparent',
    sizeMap[size],
    colorMap[color],
    `border-${thickness}`,
    className
  );

  // If there's a label, wrap spinner and label in a container
  if (label) {
    return (
      <div
        className={cn(
          'inline-flex gap-2',
          labelPositionClasses[labelPosition]
        )}
        data-testid={testId}
        style={{ animationDuration: speed }}
        {...props}
      >
        <div className={spinnerStyles} />
        <span className="text-sm">{label}</span>
      </div>
    );
  }

  // Just return the spinner
  return (
    <div
      className={spinnerStyles}
      data-testid={testId}
      style={{ animationDuration: speed }}
      {...props}
    />
  );
};

export default Spinner; 