import { toast } from 'react-toastify';

import axios from '../../utils/api';

export const sortLists = (lists) => lists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

function handleFailure({ response }, history) {
  // any other status code is super unlikely for these routes and will just be caught and render generic UnknownError
  if (response && response.status === 401) {
    toast('You must sign in', { type: 'error' });
    history.push('/users/sign_in');
    return;
  }
  throw new Error();
}

export async function fetchLists({ history }) {
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
    const nonCompletedLists = sortLists(not_completed_lists);
    return {
      userId,
      pendingLists,
      completedLists,
      nonCompletedLists,
      currentUserPermissions,
    };
  } catch (error) {
    handleFailure(error, history);
  }
}

export async function fetchCompletedLists({ history }) {
  try {
    const {
      data: { completed_lists: completedLists, current_list_permissions: currentUserPermissions },
    } = await axios.get(`/completed_lists/`);
    return {
      completedLists,
      currentUserPermissions,
    };
  } catch (error) {
    handleFailure(error, history);
  }
}
