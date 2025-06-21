import { toast } from 'react-toastify';
import * as toastUtils from './toast';

jest.mock('react-toastify', () => {
  const toastMock: any = jest.fn(); // eslint-disable-line @typescript-eslint/no-explicit-any
  toastMock.success = jest.fn();
  toastMock.error = jest.fn();
  toastMock.info = jest.fn();
  toastMock.warning = jest.fn();
  toastMock.dismiss = jest.fn();
  return {
    toast: toastMock,
    ToastContainer: (): null => null,
  };
});

describe('Toast Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('should call toast.default (backward compatibility) with correct parameters', () => {
    const message = 'Default message';
    toastUtils.showToast.default(message);

    expect(toast).toHaveBeenCalledWith(message, {
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
});
