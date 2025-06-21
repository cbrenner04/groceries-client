import { toast, type ToastOptions } from 'react-toastify';

// Default toast configuration
const defaultConfig: ToastOptions = {
  position: 'top-right',
  autoClose: 2000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  pauseOnFocusLoss: false,
  rtl: false,
  theme: 'colored',
};

// Custom toast functions with consistent configuration
export const showToast = {
  success: (message: string, options?: ToastOptions): void => {
    toast.success(message, { ...defaultConfig, ...options });
  },
  
  error: (message: string, options?: ToastOptions): void => {
    toast.error(message, { ...defaultConfig, ...options });
  },
  
  info: (message: string, options?: ToastOptions): void => {
    toast.info(message, { ...defaultConfig, ...options });
  },
  
  warning: (message: string, options?: ToastOptions): void => {
    toast.warning(message, { ...defaultConfig, ...options });
  },
  
  // For backward compatibility
  default: (message: string, options?: ToastOptions): void => {
    toast(message, { ...defaultConfig, ...options });
  },
};

// Export the original toast for advanced usage
export { toast }; 