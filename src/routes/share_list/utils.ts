import { toast } from 'react-toastify';

import axios from '../../utils/api';
import IUserList from '../../typings/IUsersList';

export async function fetchData({ listId, navigate }: { listId: string; navigate: (url: string) => void }) {
  try {
    const { data } = await axios.get(`/lists/${listId}/users_lists`);
    const userInAccepted = data.accepted.find(
      (acceptedList: IUserList) => acceptedList.user.id === data.current_user_id,
    );
    if (!userInAccepted || userInAccepted.users_list.permissions !== 'write') {
      toast('List not found', { type: 'error' });
      navigate('/lists');
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
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 401) {
        toast('You must sign in', { type: 'error' });
        navigate('/users/sign_in');
        return;
      } else if ([403, 404].includes(err.response.status)) {
        toast('List not found', { type: 'error' });
        navigate('/lists');
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error(err);
  }
}
