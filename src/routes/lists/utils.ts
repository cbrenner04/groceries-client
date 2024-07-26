import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import type { EListType, IList, TUserPermissions } from 'typings';

export const sortLists = (lists: IList[]): IList[] =>
  lists.sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)));

function handleFailure(error: unknown, navigate: (url: string) => void): void {
  const err = error as AxiosError;
  // any other status code is super unlikely for these routes and will just be caught and render generic UnknownError
  if (err.response?.status === 401) {
    toast('You must sign in', { type: 'error' });
    navigate('/users/sign_in');
  } else {
    throw new Error(JSON.stringify(err));
  }
}

export async function fetchLists({ navigate }: { navigate: (url: string) => void }): Promise<
  | {
      userId: string;
      completedLists: IList[];
      currentUserPermissions: TUserPermissions;
      pendingLists: IList[];
      incompleteLists: IList[];
    }
  | undefined
> {
  try {
    const {
      data: {
        current_user_id: userId,
        accepted_lists: { completed_lists: dCompletedLists, not_completed_lists: dNotCompletedLists },
        pending_lists: dPendingLists,
        current_list_permissions: currentUserPermissions,
      },
    } = await axios.get('/lists/');
    const pendingLists = sortLists(dPendingLists);
    const completedLists = sortLists(dCompletedLists);
    const incompleteLists = sortLists(dNotCompletedLists);
    return {
      userId,
      pendingLists,
      completedLists,
      incompleteLists,
      currentUserPermissions,
    };
  } catch (error) {
    handleFailure(error, navigate);
  }
}

export async function fetchCompletedLists({
  navigate,
}: {
  navigate: (url: string) => void;
}): Promise<{ userId: string; completedLists: IList[]; currentUserPermissions: TUserPermissions } | undefined> {
  try {
    const {
      data: {
        current_user_id: userId,
        completed_lists: completedLists,
        current_list_permissions: currentUserPermissions,
      },
    } = await axios.get('/completed_lists/');
    return {
      userId,
      completedLists,
      currentUserPermissions,
    };
  } catch (error) {
    handleFailure(error, navigate);
  }
}

export async function fetchListToEdit({ id, navigate }: { id: string; navigate: (url: string) => void }): Promise<
  | {
      listId: string;
      name: string;
      completed: boolean;
      type: EListType;
    }
  | undefined
> {
  try {
    const {
      data: { id: listId, name, completed, type: dType },
    } = await axios.get(`/lists/${id}/edit`);
    return {
      listId,
      name,
      completed,
      type: dType as EListType,
    };
  } catch (error: unknown) {
    const err = error as AxiosError;
    if (err.response) {
      if (err.response.status === 401) {
        toast('You must sign in', { type: 'error' });
        navigate('/users/sign_in');
      } else if ([403, 404].includes(err.response.status)) {
        toast('List not found', { type: 'error' });
        navigate('/lists');
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
