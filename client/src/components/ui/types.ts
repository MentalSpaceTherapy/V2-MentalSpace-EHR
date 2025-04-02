import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { ThemeColorKey, ThemeBorderRadiusKey, ThemeShadowKey } from '../../lib/theme';

// Common props that can be applied to most components
export interface BaseComponentProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  testId?: string;
}

// Size variants for components that support different sizes
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Color variants that align with our theme
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

// Status states for form fields
export type FieldStatus = 'default' | 'success' | 'error' | 'warning';

// Positioning options
export type PositionType = 'top' | 'right' | 'bottom' | 'left' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end';

// Component with children
export interface WithChildren {
  children?: ReactNode;
}

// Button props
export interface ButtonProps extends BaseComponentProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  color?: ColorVariant;
  size?: SizeVariant;
  isFullWidth?: boolean;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loadingText?: string;
}

// Input props
export interface InputProps extends BaseComponentProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  size?: SizeVariant;
  status?: FieldStatus;
  statusMessage?: string;
  isFullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  isDisabled?: boolean;
}

// Textarea props
export interface TextareaProps extends BaseComponentProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  helperText?: string;
  status?: FieldStatus;
  statusMessage?: string;
  isFullWidth?: boolean;
  isResizable?: boolean;
  isDisabled?: boolean;
  rows?: number;
}

// Select props
export interface SelectProps extends BaseComponentProps, Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  size?: SizeVariant;
  status?: FieldStatus;
  statusMessage?: string;
  isFullWidth?: boolean;
  isDisabled?: boolean;
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}

// Card props
export interface CardProps extends BaseComponentProps, WithChildren {
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  borderRadius?: ThemeBorderRadiusKey;
  shadow?: ThemeShadowKey;
  isHoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  maxWidth?: string | number;
}

// Badge props
export interface BadgeProps extends BaseComponentProps, WithChildren {
  color?: ColorVariant;
  variant?: 'solid' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
  isRounded?: boolean;
}

// Alert props
export interface AlertProps extends BaseComponentProps, WithChildren {
  title?: string | ReactNode;
  variant?: 'solid' | 'outline' | 'subtle';
  status?: 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  isClosable?: boolean;
  onClose?: () => void;
}

// Avatar props
export interface AvatarProps extends BaseComponentProps {
  name?: string;
  src?: string;
  size?: SizeVariant;
  variant?: 'circle' | 'square' | 'rounded';
  fallbackIcon?: ReactNode;
  status?: 'online' | 'away' | 'busy' | 'offline';
  statusPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Tooltip props
export interface TooltipProps extends BaseComponentProps, WithChildren {
  content: string | ReactNode;
  position?: PositionType;
  isOpen?: boolean;
  trigger?: 'hover' | 'click' | 'focus';
  hasArrow?: boolean;
  maxWidth?: string | number;
  delay?: number;
}

// Modal props
export interface ModalProps extends BaseComponentProps, WithChildren {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  isCentered?: boolean;
  footer?: ReactNode;
  hasCloseButton?: boolean;
}

// Tabs props
export interface TabsProps extends BaseComponentProps, WithChildren {
  defaultIndex?: number;
  onChange?: (index: number) => void;
  variant?: 'line' | 'enclosed' | 'rounded' | 'solid-rounded' | 'unstyled';
  isLazy?: boolean;
  orientation?: 'horizontal' | 'vertical';
  size?: SizeVariant;
  isFitted?: boolean;
}

export interface TabProps extends BaseComponentProps, WithChildren {
  title: string | ReactNode;
  isDisabled?: boolean;
  icon?: ReactNode;
  id?: string;
}

// Form props
export interface FormProps extends BaseComponentProps, WithChildren {
  onSubmit?: (data: any) => void;
  defaultValues?: Record<string, any>;
  validate?: (values: Record<string, any>) => Record<string, string>;
  resetOnSubmit?: boolean;
}

export interface FormControlProps extends BaseComponentProps, WithChildren {
  label?: string | ReactNode;
  helperText?: string | ReactNode;
  errorText?: string | ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
}

// Menu props
export interface MenuProps extends BaseComponentProps, WithChildren {
  isOpen?: boolean;
  onClose?: () => void;
  placement?: PositionType;
  offset?: number;
  trigger?: 'click' | 'hover';
  closeOnSelect?: boolean;
  closeOnBlur?: boolean;
}

export interface MenuItemProps extends BaseComponentProps, WithChildren {
  icon?: ReactNode;
  command?: string;
  isDisabled?: boolean;
  onClick?: () => void;
}

// Progress props
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  min?: number;
  size?: SizeVariant;
  hasStripe?: boolean;
  isAnimated?: boolean;
  color?: ColorVariant;
  track?: ColorVariant | 'transparent';
  isIndeterminate?: boolean;
  label?: string | ReactNode;
}

// Switch props
export interface SwitchProps extends BaseComponentProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: SizeVariant;
  isChecked?: boolean;
  isDisabled?: boolean;
  onChange?: (isChecked: boolean) => void;
  label?: string | ReactNode;
  labelPosition?: 'start' | 'end';
  color?: ColorVariant;
}

// Checkbox props
export interface CheckboxProps extends BaseComponentProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: SizeVariant;
  isChecked?: boolean;
  isDisabled?: boolean;
  isIndeterminate?: boolean;
  onChange?: (isChecked: boolean) => void;
  label?: string | ReactNode;
  labelPosition?: 'start' | 'end';
  color?: ColorVariant;
}

// Radio props
export interface RadioProps extends BaseComponentProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: SizeVariant;
  isChecked?: boolean;
  isDisabled?: boolean;
  onChange?: (isChecked: boolean) => void;
  label?: string | ReactNode;
  labelPosition?: 'start' | 'end';
  color?: ColorVariant;
  value: string | number;
}

export interface RadioGroupProps extends BaseComponentProps, Omit<InputHTMLAttributes<HTMLDivElement>, 'onChange'> {
  size?: SizeVariant;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: string | number) => void;
  isDisabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  name: string;
  label?: string | ReactNode;
}

// Spinner props
export interface SpinnerProps extends BaseComponentProps {
  size?: SizeVariant;
  color?: ColorVariant;
  thickness?: number;
  speed?: string;
  label?: string;
  labelPosition?: 'top' | 'right' | 'bottom' | 'left';
}

// Table props
export interface TableProps<T = any> extends BaseComponentProps, WithChildren {
  data: T[];
  columns: Array<{
    header: string | ReactNode;
    accessor: keyof T | string;
    cell?: (value: any, item: T, index: number) => ReactNode;
    sortable?: boolean;
    width?: string | number;
  }>;
  isStriped?: boolean;
  isBordered?: boolean;
  isHoverable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  emptyMessage?: string | ReactNode;
  onRowClick?: (item: T, index: number) => void;
  sortable?: boolean;
  defaultSortColumn?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

// Pagination props
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  size?: SizeVariant;
}

// Toast props
export interface ToastProps extends BaseComponentProps {
  title?: string;
  description?: string | ReactNode;
  status?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  isClosable?: boolean;
  position?: 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left';
  onClose?: () => void;
}

// Breadcrumb props
export interface BreadcrumbProps extends BaseComponentProps, WithChildren {
  separator?: string | ReactNode;
  spacing?: string | number;
}

export interface BreadcrumbItemProps extends BaseComponentProps, WithChildren {
  isCurrentPage?: boolean;
  href?: string;
  onClick?: () => void;
} 