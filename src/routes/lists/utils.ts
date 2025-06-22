import { toast } from 'react-toastify';
import { handleFailure } from '../../utils/handleFailure';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import type { EListType, IList, TUserPermissions } from 'typings';

export const sortLists = (lists: IList[]): IList[] =>
  lists.sort((a, b) => Number(new Date(b.created_at!)) - Number(new Date(a.created_at!)));

interface IFetchListsReturn {
  userId: string;
  completedLists: IList[];
  currentUserPermissions: TUserPermissions;
  pendingLists: IList[];
  incompleteLists: IList[];
}

export async function fetchLists(fetchParams: {
  navigate: (url: string) => void;
}): Promise<IFetchListsReturn | undefined> {
  try {
    const { data } = await axios.get('/v1/lists/');
    const pendingLists = sortLists(data.pending_lists);
    const completedLists = sortLists(data.accepted_lists.completed_lists);
    const incompleteLists = sortLists(data.accepted_lists.not_completed_lists);
    return {
      userId: data.current_user_id,
      pendingLists,
      completedLists,
      incompleteLists,
      currentUserPermissions: data.current_list_permissions,
    };
  } catch (error) {
    handleFailure({
      error: error as AxiosError,
      notFoundMessage: 'Lists not found',
      navigate: fetchParams.navigate,
      redirectURI: '/lists',
    });
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
    handleFailure({
      error: error as AxiosError,
      notFoundMessage: 'Completed lists not found',
      navigate: fetchParams.navigate,
      redirectURI: '/lists',
    });
  }
}

interface IFetchListToEditReturn {
  listId: string;
  name: string;
  completed: boolean;
  type: EListType;
}

export async function fetchListToEdit(fetchParams: {
  id: string;
  navigate: (url: string) => void;
}): Promise<IFetchListToEditReturn | undefined> {
  try {
    const { data } = await axios.get(`/v1/lists/${fetchParams.id}/edit`);
    return {
      listId: data.id,
      name: data.name,
      completed: data.completed,
      type: data.type as EListType,
    };
  } catch (error: unknown) {
    handleFailure({
      error: error as AxiosError,
      notFoundMessage: 'List not found',
      navigate: fetchParams.navigate,
      redirectURI: '/lists',
    });
  }
}

export function failure(error: unknown, navigate: (url: string) => void, setPending: (arg: boolean) => void): void {
  const err = error as AxiosError;
  if (err.response) {
    if (err.response.status === 401) {
      toast('You must sign in', { type: 'error' });
      navigate('/users/sign_in');
    } else if ([403, 404].includes(err.response.status)) {
      toast('List not found', { type: 'error' });
    } else {
      setPending(false);
      const responseTextKeys = Object.keys(err.response.data!);
      const responseErrors = responseTextKeys.map(
        (key) => `${key} ${(err.response?.data as Record<string, string>)[key]}`,
      );
      toast(responseErrors.join(' and '), { type: 'error' });
    }
  } else {
    setPending(false);
    const toastMessage = err.request ? 'Something went wrong' : err.message;
    toast(toastMessage, { type: 'error' });
  }
}

export function pluralize(listCount: number): string {
  return listCount > 1 ? 'Lists' : 'List';
}
