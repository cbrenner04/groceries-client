import { showToast } from './toast';
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
      showToast.error('You must sign in');
      if (navigate) {
        navigate('/users/sign_in');
      }
    } else if ([403, 404].includes(error.response.status)) {
      showToast.error(notFoundMessage);
      if (navigate) {
        navigate(redirectURI);
      }
    } else {
      showToast.error(DEFAULT_ERROR_MESSAGE);
      if (navigate) {
        navigate(redirectURI);
      }
    }
  } else if (error.request) {
    if (rethrow) {
      throw error;
    } else {
      showToast.error('Network error. Please check your connection.');
    }
  } else {
    if (rethrow) {
      throw error;
    } else {
      showToast.error(DEFAULT_ERROR_MESSAGE);
    }
  }
}
