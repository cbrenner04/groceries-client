import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import { handleFailure } from './handleFailure';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('handleFailure', () => {
  const mockNavigate = jest.fn();
  const mockToast = toast as jest.MockedFunction<typeof toast>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('401 Unauthorized errors', () => {
    it('should show sign in message and navigate to sign in page', () => {
      const error = {
        response: {
          status: 401,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
        navigate: mockNavigate,
      });

      expect(mockToast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('should show sign in message even without navigate function', () => {
      const error = {
        response: {
          status: 401,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
      });

      expect(mockToast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('403/404 errors', () => {
    it('should show not found message and navigate to default redirect URI', () => {
      const error = {
        response: {
          status: 403,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Resource not found',
        navigate: mockNavigate,
      });

      expect(mockToast).toHaveBeenCalledWith('Resource not found', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });

    it('should show not found message and navigate to custom redirect URI', () => {
      const error = {
        response: {
          status: 404,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Page not found',
        navigate: mockNavigate,
        redirectURI: '/home',
      });

      expect(mockToast).toHaveBeenCalledWith('Page not found', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('should show not found message even without navigate function', () => {
      const error = {
        response: {
          status: 404,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Resource not found',
      });

      expect(mockToast).toHaveBeenCalledWith('Resource not found', { type: 'error' });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Other HTTP errors', () => {
    it('should show default error message and navigate to default redirect URI', () => {
      const error = {
        response: {
          status: 500,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
        navigate: mockNavigate,
      });

      expect(mockToast).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
        { type: 'error' },
      );
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });

    it('should show default error message and navigate to custom redirect URI', () => {
      const error = {
        response: {
          status: 422,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
        navigate: mockNavigate,
        redirectURI: '/error',
      });

      expect(mockToast).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
        { type: 'error' },
      );
      expect(mockNavigate).toHaveBeenCalledWith('/error');
    });

    it('should show default error message even without navigate function', () => {
      const error = {
        response: {
          status: 500,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
      });

      expect(mockToast).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
        { type: 'error' },
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Network errors', () => {
    it('should show network error message when error.request exists', () => {
      const error = {
        request: {},
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
        navigate: mockNavigate,
      });

      expect(mockToast).toHaveBeenCalledWith('Network error. Please check your connection.', { type: 'error' });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Other errors', () => {
    it('should rethrow error when rethrow is true', () => {
      const error = new Error('Test error') as AxiosError;

      expect(() => {
        handleFailure({
          error,
          notFoundMessage: 'Not found',
          rethrow: true,
        });
      }).toThrow('Test error');

      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should show default error message when rethrow is false', () => {
      const error = new Error('Test error') as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
        rethrow: false,
      });

      expect(mockToast).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
        { type: 'error' },
      );
    });

    it('should show default error message when rethrow is not specified', () => {
      const error = new Error('Test error') as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
      });

      expect(mockToast).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
        { type: 'error' },
      );
    });
  });

  describe('Parameter defaults', () => {
    it('should use default redirectURI when not provided', () => {
      const error = {
        response: {
          status: 404,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
        navigate: mockNavigate,
      });

      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });

    it('should use custom redirectURI when provided', () => {
      const error = {
        response: {
          status: 404,
        },
      } as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
        navigate: mockNavigate,
        redirectURI: '/custom',
      });

      expect(mockNavigate).toHaveBeenCalledWith('/custom');
    });
  });
});
