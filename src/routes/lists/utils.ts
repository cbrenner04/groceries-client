import { toast } from 'react-toastify';

import axios from '../../utils/api';
import type { IList, TUserPermissions } from '../../typings';

export const sortLists = (lists: IList[]) =>
  lists.sort((a, b) => Number(new Date(b.created_at)) - Number(new Date(a.created_at)));

function handleFailure(error: any, navigate: (url: string) => void) {
  // any other status code is super unlikely for these routes and will just be caught and render generic UnknownError
  if (error.response && error.response.status === 401) {
    toast('You must sign in', { type: 'error' });
    navigate('/users/sign_in');
    return;
  }
  throw new Error(error);
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
        accepted_lists: { completed_lists, not_completed_lists },
        pending_lists,
        current_list_permissions: currentUserPermissions,
      },
    } = await axios.get('/lists/');
    const pendingLists = sortLists(pending_lists);
    const completedLists = sortLists(completed_lists);
    const incompleteLists = sortLists(not_completed_lists);
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

export async function fetchListToEdit({ id, navigate }: { id: string; navigate: (url: string) => void }) {
  try {
    const {
      data: { id: listId, name, completed, type },
    } = await axios.get(`/lists/${id}/edit`);
    return {
      listId,
      name,
      completed,
      type,
    };
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401) {
        toast('You must sign in', { type: 'error' });
        navigate('/users/sign_in');
        return;
      } else if ([403, 404].includes(error.response.status)) {
        toast('List not found', { type: 'error' });
        navigate('/lists');
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}

export function failure(error: any, navigate: (url: string) => void, setPending: (arg: boolean) => void) {
  if (error.response) {
    if (error.response.status === 401) {
      toast('You must sign in', { type: 'error' });
      navigate('/users/sign_in');
    } else if ([403, 404].includes(error.response.status)) {
      toast('List not found', { type: 'error' });
    } else {
      setPending(false);
      const responseTextKeys = Object.keys(error.response.data);
      const responseErrors = responseTextKeys.map((key) => `${key} ${error.response.data[key]}`);
      toast(responseErrors.join(' and '), { type: 'error' });
    }
  } else {
    setPending(false);
    const toastMessage = error.request ? 'Something went wrong' : error.message;
    toast(toastMessage, { type: 'error' });
  }
}

export function pluralize(listCount: number) {
  return listCount > 1 ? 'Lists' : 'List';
}
