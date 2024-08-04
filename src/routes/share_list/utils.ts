import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from '../../utils/api';
import { type IListUser, type IUsersList } from 'typings';

interface IFetchDataReturn {
  name: string;
  invitableUsers: IListUser[];
  listId: string;
  userIsOwner: boolean;
  pending: IUsersList[];
  accepted: IUsersList[];
  refused: IUsersList[];
  userId: string;
}

export async function fetchData(fetchParams: {
  listId: string;
  navigate: (url: string) => void;
}): Promise<IFetchDataReturn | undefined> {
  try {
    const { data } = await axios.get(`/lists/${fetchParams.listId}/users_lists`);
    const userInAccepted = data.accepted.find(
      (acceptedList: IUsersList) => acceptedList.user.id === data.current_user_id,
    );
    if (!userInAccepted || userInAccepted.users_list.permissions !== 'write') {
      toast('List not found', { type: 'error' });
      fetchParams.navigate('/lists');
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
  } catch (err: unknown) {
    const error = err as AxiosError;
    if (error.response) {
      if (error.response.status === 401) {
        toast('You must sign in', { type: 'error' });
        fetchParams.navigate('/users/sign_in');
        return;
      } else if ([403, 404].includes(error.response.status)) {
        toast('List not found', { type: 'error' });
        fetchParams.navigate('/lists');
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error(JSON.stringify(error));
  }
}
