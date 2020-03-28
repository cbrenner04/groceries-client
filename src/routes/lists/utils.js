import axios from '../../utils/api';
import { setUserInfo } from '../../utils/auth';

export const sortLists = lists => lists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

function handleFailure({ response, request, message }, history) {
  const newError = new Error();
  if (response) {
    setUserInfo(response.headers);
    if (response.status === 401) {
      history.push('/users/sign_in');
      return;
    }
    newError.message = `${response.status} ${response.data}`;
  } else if (request) {
    newError.message = 'Something went wrong!';
  } else {
    newError.message = message;
  }
  throw newError;
}

export async function fetchLists({ history }) {
  try {
    const headers = JSON.parse(sessionStorage.getItem('user'));
    const { data, headers: responseHeaders } = await axios.get(`/lists/`, { headers });
    setUserInfo(responseHeaders);
    const userId = data.current_user_id;
    const sortedAcceptedLists = sortLists(data.accepted_lists);
    const pendingLists = sortLists(data.pending_lists);
    const completedLists = sortedAcceptedLists.filter(list => list.completed);
    const nonCompletedLists = sortedAcceptedLists.filter(list => !list.completed);
    const lists = sortedAcceptedLists.concat(pendingLists);
    const currentUserPermissions = {};
    const userLists = await Promise.all(
      lists.map(list =>
        axios.get(`/lists/${list.id}/users_lists/${list.users_list_id}`, { headers }).catch(() => undefined),
      ),
    );
    userLists.forEach(listData => {
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
    const { data, headers } = await axios.get(`/completed_lists/`, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    });
    setUserInfo(headers);
    return data.completed_lists;
  } catch (error) {
    handleFailure(error, history);
  }
}
