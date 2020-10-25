import { toast } from 'react-toastify';

import axios from '../../utils/api';

export async function fetchData({ listId, history }) {
  try {
    const { data } = await axios.get(`/lists/${listId}/users_lists`);
    const userInAccepted = data.accepted.find((acceptedList) => acceptedList.user.id === data.current_user_id);
    if (!userInAccepted || userInAccepted.users_list.permissions !== 'write') {
      toast('List not found', { type: 'error' });
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
  } catch (error) {
    const { response } = error;
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        history.push('/users/sign_in');
        return;
      } else if ([403, 404].includes(response.status)) {
        toast('List not found', { type: 'error' });
        history.push('/lists');
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw error;
  }
}
