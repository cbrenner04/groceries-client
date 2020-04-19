import axios from '../../utils/api';

export async function fetchData({ listId, history }) {
  try {
    const { data } = await axios.get(`/lists/${listId}/users_lists`);
    const userInAccepted = data.accepted.find((acceptedList) => acceptedList.user.id === data.current_user_id);
    if (!userInAccepted || !userInAccepted.users_list.permissions === 'write') {
      history.push({
        pathname: '/lists',
        state: { errors: 'List not found' },
      });
      return;
    }
    return {
      name: data.list.name,
      invitableUsers: data.invitable_users,
      listId: data.list.id,
      userIsOwner: data.user_is_owner,
      pending: data.pending,
      accepted: data.accepted,
      refused: data.refused,
      userId: data.current_user_id,
    };
  } catch ({ response, request, message }) {
    if (response) {
      if (response.status === 401) {
        history.push({
          pathname: '/users/sign_in',
          state: { errors: 'You must sign in' },
        });
        return;
      } else if ([403, 404].includes(response.status)) {
        history.push({
          pathname: '/lists',
          state: { errors: 'List not found' },
        });
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}
