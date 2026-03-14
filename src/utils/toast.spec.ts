import { vi } from "vitest";
import { toast } from 'react-toastify';
import * as toastUtils from './toast';

// Unmock the toast utility for this test file since we want to test the actual implementation
vi.unmock('./toast');

vi.mock('react-toastify', () => {
  const toastMock: any = vi.fn(); // eslint-disable-line @typescript-eslint/no-explicit-any
  toastMock.success = vi.fn();
  toastMock.error = vi.fn();
  toastMock.info = vi.fn();
  toastMock.warning = vi.fn();
  toastMock.dismiss = vi.fn();
  return {
    toast: toastMock,
    ToastContainer: (): null => null,
  };
});

describe('Toast Utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  it('should call toast.success with correct parameters', () => {
    const message = 'Success message';
    toastUtils.showToast.success(message);

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
    toastUtils.showToast.error(message);

    expect(toast.error).toHaveBeenCalledWith(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      pauseOnFocusLoss: false,
      rtl: false,
      theme: 'colored',
    });
  });

  it('should call toast.info with correct parameters', () => {
    const message = 'Info message';
    toastUtils.showToast.info(message);

    expect(toast.info).toHaveBeenCalledWith(message, {
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

  it('should call toast.warning with correct parameters', () => {
    const message = 'Warning message';
    toastUtils.showToast.warning(message);

    expect(toast.warning).toHaveBeenCalledWith(message, {
      position: 'top-right',
      autoClose: 3000,
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
    toastUtils.showToast.info(message, customOptions);

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

  describe('Toast deduplication', () => {
    it('should prevent duplicate toasts within deduplication window', () => {
      const message = 'Duplicate error';

      // First toast should show
      toastUtils.showToast.error(message);
      expect(toast.error).toHaveBeenCalledTimes(1);

      // Second identical toast should be blocked
      toastUtils.showToast.error(message);
      expect(toast.error).toHaveBeenCalledTimes(1);

      // Fast forward past deduplication window
      vi.advanceTimersByTime(3500);

      // Now it should show again
      toastUtils.showToast.error(message);
      expect(toast.error).toHaveBeenCalledTimes(2);
    });

    it('should allow different message types to show simultaneously', () => {
      const message = 'Same message different types';

      toastUtils.showToast.error(message);
      toastUtils.showToast.warning(message);
      toastUtils.showToast.info(message);

      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.warning).toHaveBeenCalledTimes(1);
      expect(toast.info).toHaveBeenCalledTimes(1);
    });

    it('should allow different messages of same type', () => {
      toastUtils.showToast.error('First error');
      toastUtils.showToast.error('Second error');

      expect(toast.error).toHaveBeenCalledTimes(2);
    });
  });
});
