import { toast } from 'react-toastify';
import { showToast } from './toast';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('Toast Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call toast.success with correct parameters', () => {
    const message = 'Success message';
    showToast.success(message);
    
    expect(toast.success).toHaveBeenCalledWith(message, {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      pauseOnFocusLoss: false,
      rtl: false,
      theme: 'colored',
    });
  });

  it('should call toast.error with correct parameters', () => {
    const message = 'Error message';
    showToast.error(message);
    
    expect(toast.error).toHaveBeenCalledWith(message, {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      pauseOnFocusLoss: false,
      rtl: false,
      theme: 'colored',
    });
  });

  it('should merge custom options with defaults', () => {
    const message = 'Custom message';
    const customOptions = { autoClose: 5000 };
    showToast.info(message, customOptions);
    
    expect(toast.info).toHaveBeenCalledWith(message, {
      position: 'top-right',
      autoClose: 5000, // Custom option should override default
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      pauseOnFocusLoss: false,
      rtl: false,
      theme: 'colored',
    });
  });
}); 