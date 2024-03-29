import { toast } from 'react-toastify';

import axios from '../../utils/api';

export const sortLists = (lists) => lists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

function handleFailure({ response, message }, navigate) {
  // any other status code is super unlikely for these routes and will just be caught and render generic UnknownError
  if (response && response.status === 401) {
    toast('You must sign in', { type: 'error' });
    navigate('/users/sign_in');
    return;
  }
  throw new Error({ response, message });
}

export async function fetchLists({ navigate }) {
  try {
    const {
      data: {
        current_user_id: userId,
        accepted_lists: { completed_lists, not_completed_lists },
        pending_lists,
        current_list_permissions: currentUserPermissions,
      },
    } = await axios.get(`/lists/`);
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

export async function fetchCompletedLists({ navigate }) {
  try {
    const {
      data: {
        current_user_id: userId,
        completed_lists: completedLists,
        current_list_permissions: currentUserPermissions,
      },
    } = await axios.get(`/completed_lists/`);
    return {
      userId,
      completedLists,
      currentUserPermissions,
    };
  } catch (error) {
    handleFailure(error, navigate);
  }
}

export async function fetchListToEdit({ id, navigate }) {
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
  } catch ({ response }) {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        navigate('/users/sign_in');
        return;
      } else if ([403, 404].includes(response.status)) {
        toast('List not found', { type: 'error' });
        navigate('/lists');
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}

export function failure({ request, response, message }, navigate, setPending) {
  if (response) {
    if (response.status === 401) {
      toast('You must sign in', { type: 'error' });
      navigate('/users/sign_in');
    } else if ([403, 404].includes(response.status)) {
      toast('List not found', { type: 'error' });
    } else {
      setPending(false);
      const responseTextKeys = Object.keys(response.data);
      const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
      toast(responseErrors.join(' and '), { type: 'error' });
    }
  } else {
    setPending(false);
    const toastMessage = request ? 'Something went wrong' : message;
    toast(toastMessage, { type: 'error' });
  }
}

export function pluralize(listCount) {
  return listCount > 1 ? 'Lists' : 'List';
}
