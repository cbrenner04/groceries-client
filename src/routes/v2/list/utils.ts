import { handleFailure } from '../../../utils/handleFailure';
import { AxiosError } from 'axios';
import axios from '../../../utils/api';
import type {
  IList,
  IListItemConfiguration,
  IListItemField,
  IListItemFieldConfiguration,
  IListUser,
  IV2ListItem,
  EUserPermissions,
  TUserPermissions,
} from 'typings';
import { EListType } from 'typings';
import moment from 'moment';

export interface IFulfilledListData {
  current_user_id: string;
  list: IList;
  not_completed_items: IV2ListItem[];
  completed_items: IV2ListItem[];
  list_users: IListUser[];
  permissions: EUserPermissions;
  lists_to_update: IList[];
  list_item_configuration: IListItemConfiguration;
  categories: string[];
}

export interface IFulfilledEditListData {
  id: string;
  name: string;
  completed: boolean;
  type: EListType;
  archived_at: string | null;
  refreshed: boolean;
  list_item_configuration_id: string | null;
}

export interface IFulfilledEditListItemData {
  id: string;
  item: IV2ListItem;
  list: IList;
  list_users: IListUser[];
  list_item_configuration: IListItemConfiguration;
  list_item_field_configurations: IListItemFieldConfiguration[];
}

export interface IFulfilledBulkEditItemsData {
  list: IList;
  lists: IList[];
  items: IV2ListItem[];
  categories: string[];
  list_users: IListUser[];
  list_item_configuration: IListItemConfiguration;
  list_item_field_configurations: IListItemFieldConfiguration[];
}

export function itemName(item: IV2ListItem, listType: EListType): string {
  const fields = Array.isArray(item.fields) ? item.fields : [];

  const getFieldValue = (label: string): string => {
    const field = fields.find((f) => f.label === label);
    return field?.data ?? '';
  };

  switch (listType) {
    case EListType.BOOK_LIST: {
      const title = getFieldValue('title');
      const author = getFieldValue('author');
      return `${title ? `"${title}"` : ''} ${author}`.trim();
    }
    case EListType.GROCERY_LIST: {
      const quantity = getFieldValue('quantity');
      const product = getFieldValue('product');
      return `${quantity} ${product}`.trim();
    }
    case EListType.MUSIC_LIST: {
      const title = getFieldValue('title');
      const artist = getFieldValue('artist');
      const album = getFieldValue('album');
      return `${title ? `"${title}"` : ''} ${artist}${artist && album ? ' - ' : ''}${album}`.trim();
    }
    case EListType.SIMPLE_LIST: {
      return getFieldValue('content');
    }
    case EListType.TO_DO_LIST: {
      const task = getFieldValue('task');
      const assignee = getFieldValue('assignee_email') || getFieldValue('assignee_id');
      const dueBy = getFieldValue('due_by');
      return `${task}${assignee ? `\nAssigned To: ${assignee}` : ''}\nDue By: ${moment(dueBy).format('LL')}`.trim();
    }
    default:
      return fields
        .map((f) => f.data)
        .join(' ')
        .trim();
  }
}

export async function fetchList(fetchParams: {
  id: string;
  navigate: (url: string) => void;
}): Promise<IFulfilledListData | undefined> {
  try {
    const { data } = await axios.get(`/v2/lists/${fetchParams.id}`);

    // Add defensive checks for undefined data
    if (!data) {
      throw new AxiosError('No data received from server', '404');
    }

    // Ensure required fields exist
    if (!data.list || !data.not_completed_items || !data.completed_items) {
      throw new AxiosError('Invalid data structure received from server', '500');
    }

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
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'List not found',
      navigate: fetchParams.navigate,
      redirectURI: '/lists',
      rethrow: true,
    });
  }
}

export async function fetchListToEdit(fetchParams: {
  id: string;
  navigate: (url: string) => void;
}): Promise<IFulfilledEditListData | undefined> {
  try {
    const { data } = await axios.get(`/v2/lists/${fetchParams.id}/edit`);

    // Add defensive checks for undefined data
    if (!data) {
      throw new AxiosError('No data received from server', '404');
    }

    return data;
  } catch (err: unknown) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'List not found',
      navigate: fetchParams.navigate,
      redirectURI: '/lists',
    });
  }
}

export async function fetchListItemToEdit(fetchParams: {
  list_id: string;
  id: string;
  navigate: (url: string) => void;
}): Promise<IFulfilledEditListItemData | undefined> {
  try {
    const { data } = await axios.get(`/v2/lists/${fetchParams.list_id}/list_items/${fetchParams.id}/edit`);

    // Add defensive checks for undefined data
    if (!data) {
      throw new AxiosError('No data received from server', '404');
    }

    return data;
  } catch (err: unknown) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'List item not found',
      navigate: fetchParams.navigate,
      redirectURI: `/v2/lists/${fetchParams.list_id}/`,
    });
  }
}

export async function fetchItemsToEdit(fetchParams: {
  list_id: string;
  search: string;
  navigate: (url: string) => void;
}): Promise<IFulfilledBulkEditItemsData | undefined> {
  try {
    const { data } = await axios.get(`/v2/lists/${fetchParams.list_id}/list_items/bulk_update${fetchParams.search}`);

    // Add defensive checks for undefined data
    if (!data) {
      throw new AxiosError('No data received from server', '404');
    }

    return data;
  } catch (err: unknown) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'One or more items not found',
      navigate: fetchParams.navigate,
      redirectURI: `/v2/lists/${fetchParams.list_id}/`,
    });
  }
}

export async function fetchCompletedLists(fetchParams: {
  navigate: (url: string) => void;
}): Promise<{ userId: string; completedLists: IList[]; currentUserPermissions: TUserPermissions } | undefined> {
  try {
    const { data } = await axios.get('/v2/completed_lists/');
    return {
      userId: data.current_user_id,
      completedLists: data.completed_lists,
      currentUserPermissions: data.current_list_permissions,
    };
  } catch (err: unknown) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'Failed to fetch completed lists',
      navigate: fetchParams.navigate,
      redirectURI: '/lists',
    });
  }
}
