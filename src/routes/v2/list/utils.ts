import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from '../../../utils/api';
import type { IList, IListItemConfiguration, IListItemField, IListUser, IV2ListItem, EUserPermissions } from 'typings';

function handleFailure(
  error: AxiosError,
  notFoundMessage: string,
  navigate: (url: string) => void,
  redirectURI: string,
): void {
  if (error.response) {
    if (error.response.status === 401) {
      toast('You must sign in', { type: 'error' });
      navigate('/users/sign_in');
      return;
    } else if ([403, 404].includes(error.response.status)) {
      toast(notFoundMessage, { type: 'error' });
      navigate(redirectURI);
      return;
    } else {
      toast(`Something went wrong. Data may be incomplete and user actions may not persist.`, { type: 'error' });
      return;
    }
  }
  // any other errors will just be caught and render the generic UnknownError
  throw new Error();
}

export interface IFulfilledListData {
  current_user_id: string;
  list: IList;
  not_completed_items: IV2ListItem[];
  completed_items: IV2ListItem[];
  list_users: IListUser[];
  permissions: EUserPermissions;
  lists_to_update: IList[];
  list_item_configurations: IListItemConfiguration[];
  list_item_configuration: IListItemConfiguration;
  categories: string[];
}

export async function fetchList(fetchParams: {
  id: string;
  navigate: (url: string) => void;
}): Promise<IFulfilledListData | undefined> {
  try {
    const { data } = await axios.get(`/v2/lists/${fetchParams.id}`);
    const categories = data.not_completed_items
      .concat(data.completed_items)
      .map((item: IV2ListItem) => {
        return item.fields.find((field: IListItemField) => field.label === 'category')?.data;
      })
      .filter(Boolean)
      .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index);
    data.categories = categories;

    return data;
  } catch (err: unknown) {
    handleFailure(err as AxiosError, 'List not found', fetchParams.navigate, '/lists');
  }
}
