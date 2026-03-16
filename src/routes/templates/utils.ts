import { type AxiosError } from 'axios';
import { showToast } from '../../utils/toast';
import axios from 'utils/api';
import type { IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

export interface IFetchTemplatesReturn {
  templates: IListItemConfiguration[];
}

export interface IFetchTemplateToEditReturn {
  template: IListItemConfiguration;
  fieldConfigurations: IListItemFieldConfiguration[];
}

// Fetch all templates for the current user
export async function fetchTemplates(fetchParams: {
  navigate: (url: string) => void;
}): Promise<IFetchTemplatesReturn | undefined> {
  try {
    const { data } = await axios.get('/list_item_configurations');
    const templates = data.filter((t: IListItemConfiguration) => !t.archived_at);
    return { templates };
  } catch (error) {
    handleFetchFailure(error, fetchParams.navigate);
  }
}

// Fetch single template + its field configurations for editing
export async function fetchTemplateToEdit(fetchParams: {
  id: string;
  navigate: (url: string) => void;
}): Promise<IFetchTemplateToEditReturn | undefined> {
  try {
    const [configResponse, fieldsResponse] = await Promise.all([
      axios.get(`/list_item_configurations/${fetchParams.id}/edit`),
      axios.get(`/list_item_configurations/${fetchParams.id}/list_item_field_configurations`),
    ]);
    return {
      template: configResponse.data,
      fieldConfigurations: fieldsResponse.data,
    };
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response?.status === 401) {
      showToast.error('You must sign in');
      fetchParams.navigate('/users/sign_in');
    } else if ([403, 404].includes(err.response?.status ?? 0)) {
      showToast.error('Template not found');
      fetchParams.navigate('/templates');
    } else {
      throw new Error('Unexpected error editing template', { cause: error });
    }
  }
}

// Error handler for list-level failures (matches lists/utils.ts pattern)
function handleFetchFailure(error: unknown, navigate: (url: string) => void): void {
  const err = error as AxiosError;
  if (err.response?.status === 401) {
    showToast.error('You must sign in');
    navigate('/users/sign_in');
  } else {
    throw new Error(JSON.stringify(err));
  }
}

// Error handler for form submission failures
export function failure(error: unknown, navigate: (url: string) => void, setPending: (arg: boolean) => void): void {
  const err = error as AxiosError;
  if (err.response) {
    if (err.response.status === 401) {
      showToast.error('You must sign in');
      navigate('/users/sign_in');
    } else if ([403, 404].includes(err.response.status)) {
      showToast.error('Template not found');
    } else {
      setPending(false);
      const responseTextKeys = Object.keys((err.response.data ?? {}) as Record<string, unknown>);
      const responseErrors = responseTextKeys.map(
        (key) => `${key} ${(err.response?.data as Record<string, string>)[key]}`,
      );
      showToast.error(responseErrors.join(' and '));
    }
  } else {
    setPending(false);
    const toastMessage = err.request ? 'Something went wrong' : err.message;
    showToast.error(toastMessage);
  }
}
