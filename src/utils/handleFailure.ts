import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Data may be incomplete and user actions may not persist.';

export function handleFailure(params: {
  error: AxiosError;
  notFoundMessage: string;
  navigate?: (url: string) => void;
  redirectURI?: string;
  rethrow?: boolean;
}): void {
  const { error, notFoundMessage, navigate, redirectURI = '/lists', rethrow = false } = params;

  if (error.response) {
    if (error.response.status === 401) {
      toast('You must sign in', { type: 'error' });
      if (navigate) {
        navigate('/users/sign_in');
      }
    } else if ([403, 404].includes(error.response.status)) {
      toast(notFoundMessage, { type: 'error' });
      if (navigate) {
        navigate(redirectURI);
      }
    } else {
      toast(DEFAULT_ERROR_MESSAGE, { type: 'error' });
      if (navigate) {
        navigate(redirectURI);
      }
    }
  } else if (error.request) {
    if (rethrow) {
      throw error;
    } else {
      toast('Network error. Please check your connection.', { type: 'error' });
    }
  } else {
    if (rethrow) {
      throw error;
    } else {
      toast(DEFAULT_ERROR_MESSAGE, { type: 'error' });
    }
  }
}
