import { handleFailure } from '../../utils/handleFailure';
import { AxiosError } from 'axios';
import axios from '../../utils/api';
import type {
  IList,
  IListItemConfiguration,
  IListItemField,
  IListItemFieldConfiguration,
  IListUser,
  IListItem,
  EUserPermissions,
  TUserPermissions,
} from 'typings';
import { normalizeCategoryKey } from '../../utils/format';

import { isBooleanFieldConfig } from './fieldHelpers';

export interface IFulfilledListData {
  current_user_id: string;
  list: IList;
  not_completed_items: IListItem[];
  completed_items: IListItem[];
  list_users: IListUser[];
  permissions: EUserPermissions;
  lists_to_update: IList[];
  list_item_configuration: IListItemConfiguration;
  categories: string[];
  // Optional preloaded configs to remove first-open flicker
  list_item_field_configurations?: IListItemFieldConfiguration[];
}

export interface IFulfilledEditListData {
  id: string;
  name: string;
  completed: boolean;
  archived_at: string | null;
  refreshed: boolean;
  list_item_configuration_id: string | null;
}

export interface IFulfilledEditListItemData {
  id: string;
  item: IListItem;
  list: IList;
  list_users: IListUser[];
  list_item_configuration: IListItemConfiguration;
  list_item_field_configurations: IListItemFieldConfiguration[];
}

export interface IFulfilledBulkEditItemsData {
  list: IList;
  lists: IList[];
  items: IListItem[];
  categories: string[];
  list_users: IListUser[];
  list_item_configuration: IListItemConfiguration;
  list_item_field_configurations: IListItemFieldConfiguration[];
}

export function itemName(item: IListItem): string {
  if (!Array.isArray(item.fields) || item.fields.length === 0) {
    return '';
  }

  // Find the primary field first
  const primaryField = item.fields.find((f) => f.primary === true);
  if (primaryField?.data) {
    return String(primaryField.data);
  }

  // Fallback to first non-category field if no primary is set
  const firstField = item.fields.find((f) => f.label !== 'category');
  return firstField?.data ? String(firstField.data) : '';
}

export function secondaryFieldsDisplay(item: IListItem): string {
  if (!Array.isArray(item.fields) || item.fields.length === 0) {
    return '';
  }

  return item.fields
    .filter((f) => f.label !== 'category' && f.primary !== true)
    .map((f) => {
      if (!f.data && f.data !== false) {
        return null;
      }
      const isBoolean = isBooleanFieldConfig(f) || typeof f.data === 'boolean';
      // For booleans, only show if true (skip false values for cleaner display)
      if (isBoolean && (f.data === 'false' || f.data === false)) {
        return null;
      }
      return `${f.label}: ${f.data}`;
    })
    .filter(Boolean)
    .join(' ')
    .trim();
}

export async function fetchList(fetchParams: {
  id: string;
  navigate: (url: string) => void;
  signal?: AbortSignal;
}): Promise<IFulfilledListData | undefined> {
  try {
    const { data } = await axios.get(`/lists/${fetchParams.id}`, { signal: fetchParams.signal });

    // Add defensive checks for undefined data
    if (!data) {
      throw new AxiosError('No data received from server', '404');
    }

    // Ensure required fields exist
    if (!data.list || !data.not_completed_items || !data.completed_items) {
      throw new AxiosError('Invalid data structure received from server', '500');
    }

    const categoriesMap = new Map<string, string>();
    data.not_completed_items.concat(data.completed_items).forEach((item: IListItem) => {
      const rawCategory = item.fields.find((field: IListItemField) => field.label === 'category')?.data;
      if (typeof rawCategory !== 'string') {
        return;
      }
      const trimmedCategory = rawCategory.trimEnd();
      if (trimmedCategory === '') {
        return;
      }
      const key = normalizeCategoryKey(trimmedCategory);
      if (!categoriesMap.has(key)) {
        categoriesMap.set(key, trimmedCategory);
      }
    });
    const categories = Array.from(categoriesMap.values());
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
    const { data } = await axios.get(`/lists/${fetchParams.id}/edit`);

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
    const { data } = await axios.get(`/lists/${fetchParams.list_id}/list_items/${fetchParams.id}/edit`);

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
      redirectURI: `/lists/${fetchParams.list_id}/`,
    });
  }
}

export async function fetchItemsToEdit(fetchParams: {
  list_id: string;
  search: string;
  navigate: (url: string) => void;
}): Promise<IFulfilledBulkEditItemsData | undefined> {
  try {
    const { data } = await axios.get(`/lists/${fetchParams.list_id}/list_items/bulk_update${fetchParams.search}`);

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
      redirectURI: `/lists/${fetchParams.list_id}/`,
    });
  }
}

export async function fetchCompletedLists(fetchParams: {
  navigate: (url: string) => void;
}): Promise<{ userId: string; completedLists: IList[]; currentUserPermissions: TUserPermissions } | undefined> {
  try {
    const { data } = await axios.get('/completed_lists/');
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
      rethrow: true,
    });
  }
}
