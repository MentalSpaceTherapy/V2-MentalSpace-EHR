import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types for toast notifications
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'destructive';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

// Default duration in milliseconds
const DEFAULT_TOAST_DURATION = 5000;

// Global toast state shared across components
const toasts: ToastProps[] = [];
let listeners: ((toasts: ToastProps[]) => void)[] = [];

// Update all listeners with current toasts
const notify = () => {
  listeners.forEach(listener => listener([...toasts]));
};

/**
 * Hook for managing toast notifications
 * @returns Toast functions and state
 */
export function useToast() {
  const [toastState, setToastState] = useState<ToastProps[]>(toasts);

  // Add listener on mount, remove on unmount
  useState(() => {
    const listener = (updatedToasts: ToastProps[]) => {
      setToastState(updatedToasts);
    };

    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  });

  // Create a new toast notification
  const toast = useCallback((props: Omit<ToastProps, 'id'>) => {
    const id = uuidv4();
    const newToast: ToastProps = {
      id,
      variant: 'default',
      duration: DEFAULT_TOAST_DURATION,
      ...props
    };

    // Add toast to global array
    toasts.push(newToast);
    notify();

    // Auto-dismiss after duration
    if (newToast.duration !== Infinity) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  // Dismiss a toast by ID
  const dismiss = useCallback((id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      const toast = toasts[index];
      toasts.splice(index, 1);
      notify();
      
      // Call onClose handler if provided
      if (toast.onClose) {
        toast.onClose();
      }
    }
  }, []);

  // Dismiss all toasts
  const dismissAll = useCallback(() => {
    // Call onClose for each toast
    toasts.forEach(toast => {
      if (toast.onClose) {
        toast.onClose();
      }
    });
    
    // Clear the array
    toasts.length = 0;
    notify();
  }, []);

  return {
    toast,
    dismiss,
    dismissAll,
    toasts: toastState
  };
} 