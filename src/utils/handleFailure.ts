import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

export function handleFailure(params: {
  error: AxiosError;
  notFoundMessage: string;
  navigate: (url: string) => void;
  redirectURI?: string;
  shouldThrow?: boolean;
}): void {
  const { error, notFoundMessage, navigate, redirectURI = '/lists', shouldThrow = true } = params;
  if (error.response) {
    if (error.response.status === 401) {
      toast('You must sign in', { type: 'error' });
      navigate('/users/sign_in');
    } else if ([403, 404].includes(error.response.status)) {
      toast(notFoundMessage, { type: 'error' });
      navigate(redirectURI);
    } else {
      toast(`Something went wrong. Data may be incomplete and user actions may not persist.`, { type: 'error' });
    }
  }
  /* istanbul ignore else */
  if (shouldThrow) {
    throw new Error();
  }
}
