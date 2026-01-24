import { type AxiosError } from 'axios';

import { showToast } from '../../utils/toast';

import axios from 'utils/api';
import type { IList, IListItemConfiguration, TUserPermissions } from 'typings';

export const sortLists = (lists: IList[]): IList[] =>
  lists.sort((a, b) => Number(new Date(b.created_at!)) - Number(new Date(a.created_at!)));

function handleFailure(error: unknown, navigate: (url: string) => void): void {
  const err = error as AxiosError;
  // any other status code is super unlikely for these routes and will just be caught and render generic UnknownError
  if (err.response?.status === 401) {
    showToast.error('You must sign in');
    navigate('/users/sign_in');
  } else {
    throw new Error(JSON.stringify(err));
  }
}

export interface IFetchListsReturn {
  userId: string;
  completedLists: IList[];
  currentUserPermissions: TUserPermissions;
  pendingLists: IList[];
  incompleteLists: IList[];
  listItemConfigurations: IListItemConfiguration[];
}

export async function fetchLists(fetchParams: {
  navigate: (url: string) => void;
}): Promise<IFetchListsReturn | undefined> {
  try {
    const { data } = await axios.get('/lists/');
    const pendingLists = sortLists(data.pending_lists);
    const completedLists = sortLists(data.accepted_lists.completed_lists);
    const incompleteLists = sortLists(data.accepted_lists.not_completed_lists);
    return {
      userId: data.current_user_id,
      pendingLists,
      completedLists,
      incompleteLists,
      currentUserPermissions: data.current_list_permissions,
      listItemConfigurations: data.list_item_configurations,
    };
  } catch (error) {
    handleFailure(error, fetchParams.navigate);
  }
}

export async function fetchCompletedLists(fetchParams: {
  navigate: (url: string) => void;
}): Promise<{ userId: string; completedLists: IList[]; currentUserPermissions: TUserPermissions } | undefined> {
  try {
    const { data } = await axios.get('/completed_lists/');
    return {
      userId: data.current_user_id,
      completedLists: data.completed_lists,
      currentUserPermissions: data.current_list_permissions,
    };
  } catch (error) {
    handleFailure(error, fetchParams.navigate);
  }
}

interface IFetchListToEditReturn {
  listId: string;
  name: string;
  completed: boolean;
  list_item_configuration_id: string;
}

export async function fetchListToEdit(fetchParams: {
  id: string;
  navigate: (url: string) => void;
}): Promise<IFetchListToEditReturn | undefined> {
  try {
    const { data } = await axios.get(`/lists/${fetchParams.id}/edit`);
    return {
      listId: data.id,
      name: data.name,
      completed: data.completed,
      list_item_configuration_id: data.list_item_configuration_id,
    };
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response) {
      if (err.response.status === 401) {
        showToast.error('You must sign in');
        fetchParams.navigate('/users/sign_in');
      } else if ([403, 404].includes(err.response.status)) {
        showToast.error('List not found');
        fetchParams.navigate('/lists');
      } else {
        // any other errors will just be caught and render the generic UnknownError
        throw new Error();
      }
    } else {
      // any other errors will just be caught and render the generic UnknownError
      throw new Error();
    }
  }
}

export function failure(error: unknown, navigate: (url: string) => void, setPending: (arg: boolean) => void): void {
  const err = error as AxiosError;
  if (err.response) {
    if (err.response.status === 401) {
      showToast.error('You must sign in');
      navigate('/users/sign_in');
    } else if ([403, 404].includes(err.response.status)) {
      showToast.error('List not found');
    } else {
      setPending(false);
      const responseTextKeys = Object.keys(err.response.data!);
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

export function pluralize(listCount: number): string {
  return listCount > 1 ? 'Lists' : 'List';
}
