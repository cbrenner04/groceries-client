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
    // TODO: confirm required items come back
    const { data } = await axios.get(`/lists/`);
    const userId = data.current_user_id;
    const sortedAcceptedLists = sortLists(data.accepted_lists);
    const pendingLists = sortLists(data.pending_lists);
    const completedLists = sortedAcceptedLists.filter((list) => list.completed);
    const nonCompletedLists = sortedAcceptedLists.filter((list) => !list.completed);
    const lists = sortedAcceptedLists.concat(pendingLists);
    const currentUserPermissions = {};
    // TODO: this information should be returned with the above request
    const usersListsRequests = await Promise.allSettled(
      lists.map((list) => axios.get(`/lists/${list.id}/users_lists/${list.users_list_id}`)),
    );
    const userLists = usersListsRequests
      .map((request) => {
        if (request.status === 'fulfilled') {
          return request.value;
        }
        return null;
      })
      .filter(Boolean);
    userLists.forEach((listData) => {
      const {
        data: { list_id: listId, permissions },
      } = listData;
      currentUserPermissions[listId] = permissions;
    });
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
      data: { completed_lists: completedLists },
    } = await axios.get(`/completed_lists/`);
    const currentUserPermissions = {};
    // TODO: this information should be returned with the above request
    const usersListsRequests = await Promise.allSettled(
      completedLists.map((list) => axios.get(`/lists/${list.id}/users_lists/${list.users_list_id}`)),
    );
    const userLists = usersListsRequests
      .map((request) => {
        if (request.status === 'fulfilled') {
          return request.value;
        }
        return null;
      })
      .filter(Boolean);
    userLists.forEach((listData) => {
      const {
        data: { list_id: listId, permissions },
      } = listData;
      currentUserPermissions[listId] = permissions;
    });
    return {
      completedLists,
      currentUserPermissions,
    };
  } catch (error) {
    handleFailure(error, history);
  }
}
