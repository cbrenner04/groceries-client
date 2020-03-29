import axios from '../../utils/api';

export async function fetchData({ listId, history }) {
  try {
    const { data } = await axios.get(`/lists/${listId}/users_lists`);
    const userInAccepted = data.accepted.find(acceptedList => acceptedList.user.id === data.current_user_id);
    if (!userInAccepted || !userInAccepted.users_list.permissions === 'write') {
      history.push('/lists');
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
    const newError = new Error();
    if (response) {
      if (response.status === 401) {
        history.push({
          pathname: '/users/sign_in',
          state: { errors: 'You must sign in' },
        });
      } else if (response.status === 403) {
        // TODO: how do we pass error messages along
        history.push('/lists');
      } else {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map(key => `${key} ${response.data[key]}`);
        newError.message = responseErrors.join(' and ');
      }
    } else if (request) {
      newError.message = 'Something went wrong!';
    } else {
      newError.message = message;
    }
    throw newError;
  }
}
