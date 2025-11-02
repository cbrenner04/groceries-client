import { toast, type ToastOptions } from 'react-toastify';

// Toast deduplication state
const activeToasts = new Map<
  string,
  { timestamp: number; toastId: ReturnType<typeof toast>; timeoutId: ReturnType<typeof setTimeout> }
>();
const DEDUPLICATION_WINDOW = 3000; // 3 seconds

// Default configurations for different toast types
const defaultConfig: ToastOptions = {
  position: 'top-right',
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  pauseOnFocusLoss: false,
  rtl: false,
  theme: 'colored',
};

// Duration configurations based on message type and industry standards
const durationConfig = {
  success: 2000, // Quick acknowledgment
  info: 2000, // Quick acknowledgment
  warning: 3000, // Standard duration
  error: 5000, // Longer for errors to ensure user sees them
};

// Clear expired toasts from deduplication tracking
const clearExpiredToasts = (): void => {
  const now = Date.now();
  for (const [key, value] of activeToasts.entries()) {
    if (now - value.timestamp > DEDUPLICATION_WINDOW) {
      clearTimeout(value.timeoutId);
      activeToasts.delete(key);
    }
  }
};

// Show toast with deduplication
const showToastWithDeduplication = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  options?: ToastOptions,
): void => {
  clearExpiredToasts();

  const deduplicationKey = `${type}:${message}`;
  const now = Date.now();

  // Check if same toast was shown recently
  const existingToast = activeToasts.get(deduplicationKey);
  if (existingToast) {
    // Clear any existing timeout to prevent memory leaks
    clearTimeout(existingToast.timeoutId);
    return; // Skip duplicate toast
  }

  // Configure duration based on type, allow override
  const config = {
    ...defaultConfig,
    autoClose: options?.autoClose ?? durationConfig[type],
    ...options,
  };

  // Show toast and track it
  const toastId = toast[type](message, config);

  // Schedule automatic cleanup after deduplication window to prevent memory leaks
  const timeoutId = setTimeout(() => {
    activeToasts.delete(deduplicationKey);
  }, DEDUPLICATION_WINDOW);

  activeToasts.set(deduplicationKey, { timestamp: now, toastId, timeoutId });
};

// Custom toast functions with deduplication and consistent configuration
export const showToast = {
  success: (message: string, options?: ToastOptions): void => {
    showToastWithDeduplication('success', message, options);
  },

  error: (message: string, options?: ToastOptions): void => {
    showToastWithDeduplication('error', message, options);
  },

  info: (message: string, options?: ToastOptions): void => {
    showToastWithDeduplication('info', message, options);
  },

  warning: (message: string, options?: ToastOptions): void => {
    showToastWithDeduplication('warning', message, options);
  },

  // For backward compatibility
  default: (message: string, options?: ToastOptions): void => {
    const config = {
      ...defaultConfig,
      autoClose: options?.autoClose ?? durationConfig.info,
      ...options,
    };
    toast(message, config);
  },
};

// Export the original toast for advanced usage
export { toast };
