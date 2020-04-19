import axios from '../../utils/api';

export const sortLists = (lists) => lists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

function handleFailure({ response }, history) {
  // any other status code is super unlikely for these routes and will just be caught and render generic UnknownError
  if (response && response.status === 401) {
    history.push({
      pathname: '/users/sign_in',
      state: { errors: 'You must sign in' },
    });
    return;
  }
  throw new Error();
}

export async function fetchLists({ history }) {
  try {
    const { data } = await axios.get(`/lists/`);
    const userId = data.current_user_id;
    const sortedAcceptedLists = sortLists(data.accepted_lists);
    const pendingLists = sortLists(data.pending_lists);
    const completedLists = sortedAcceptedLists.filter((list) => list.completed);
    const nonCompletedLists = sortedAcceptedLists.filter((list) => !list.completed);
    const lists = sortedAcceptedLists.concat(pendingLists);
    const currentUserPermissions = {};
    const userLists = await Promise.all(
      lists.map((list) => axios.get(`/lists/${list.id}/users_lists/${list.users_list_id}`).catch(() => undefined)),
    );
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
    const { data } = await axios.get(`/completed_lists/`);
    return data.completed_lists;
  } catch (error) {
    handleFailure(error, history);
  }
}
