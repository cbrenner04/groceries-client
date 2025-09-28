import { showToast } from './toast';
import type { AxiosError } from 'axios';
import { handleFailure } from './handleFailure';

// Mock toast utility
jest.mock('./toast', () => ({
  showToast: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

describe('handleFailure', () => {
  const mockNavigate = jest.fn();
  const mockShowToast = showToast as jest.Mocked<typeof showToast>;

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

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
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

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
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

      expect(mockShowToast.error).toHaveBeenCalledWith('Resource not found');
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

      expect(mockShowToast.error).toHaveBeenCalledWith('Page not found');
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

      expect(mockShowToast.error).toHaveBeenCalledWith('Resource not found');
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

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
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

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
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

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
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

      expect(mockShowToast.error).toHaveBeenCalledWith('Network error. Please check your connection.');
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

      expect(mockShowToast.error).not.toHaveBeenCalled();
    });

    it('should show default error message when rethrow is false', () => {
      const error = new Error('Test error') as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
        rethrow: false,
      });

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
      );
    });

    it('should show default error message when rethrow is not specified', () => {
      const error = new Error('Test error') as AxiosError;

      handleFailure({
        error,
        notFoundMessage: 'Not found',
      });

      expect(mockShowToast.error).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
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
