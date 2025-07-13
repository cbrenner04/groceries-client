import { handleFailure } from '../../../utils/handleFailure';
import { type AxiosError } from 'axios';
import axios from '../../../utils/api';
import type { IList, IListItemConfiguration, IListItemField, IListUser, IV2ListItem, EUserPermissions } from 'typings';
import { EListType } from 'typings';

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
      return getFieldValue('task');
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
      throw new Error('No data received from server');
    }

    // Ensure required fields exist
    if (!data.list || !data.not_completed_items || !data.completed_items) {
      throw new Error('Invalid data structure received from server');
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
    });
  }
}
