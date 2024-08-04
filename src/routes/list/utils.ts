import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from '../../utils/api';
import { EListType, type IList, type IListItem, type IListUser } from '../../typings';

export function itemName(item: IListItem, listType: EListType): string | undefined {
  return {
    BookList: `${item.title ? `"${item.title}"` : ''} ${item.author ?? ''}`,
    GroceryList: `${item.quantity ?? ''} ${item.product ?? ''}`,
    MusicList:
      `${item.title ? `"${item.title}"` : ''} ${item.artist ?? ''}` +
      `${item.artist && item.album ? ' - ' : ''}${item.album ?? ''}`,
    SimpleList: item.content,
    ToDoList: item.task,
  }[listType]?.trim();
}

export function mapIncludedCategories(items: IListItem[]): string[] {
  const cats = [''];
  items.forEach((item) => {
    if (!item.category) {
      return;
    }
    const cat = item.category.toLowerCase();
    if (!cats.includes(cat)) {
      cats.push(cat);
    }
  });
  return cats;
}

export function categorizeNotPurchasedItems(items: IListItem[], categories: string[]): Record<string, IListItem[]> {
  const obj: Record<string, IListItem[]> = {};
  categories.forEach((cat) => {
    obj[cat] = [];
  });
  items.forEach((item) => {
    if (!item.category) {
      obj[''].push(item);
      return;
    }
    const cat = item.category.toLowerCase();
    // TODO: why is this setting off this rule?
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!obj[cat]) {
      obj[cat] = [];
    }
    obj[cat].push(item);
  });
  return obj;
}

function performSort(items: IListItem[], sortAttrs: (keyof IListItem)[]): IListItem[] {
  // return when all items are sorted
  if (sortAttrs.length === 0) {
    return items;
  }
  const sortAttr = sortAttrs.pop()!;
  const sorted = items.sort((a, b) => {
    const aSorter = a[sortAttr];
    const bSorter = b[sortAttr];
    // the sort from the server comes back with items with number_in_series: `null` at the end of the list
    // without the next two lines this would put those items at the front of the list
    if (!aSorter) {
      return 1;
    }
    if (!bSorter) {
      return -1;
    }
    const positiveBranch = aSorter > bSorter ? 1 : 0;
    return aSorter < bSorter ? -1 : positiveBranch;
  });
  return performSort(sorted, sortAttrs);
}

export function sortItems(listType: EListType, items: IListItem[]): IListItem[] {
  let sortAttrs: (keyof IListItem)[] = [];
  if (listType === EListType.BOOK_LIST) {
    sortAttrs = ['author', 'number_in_series', 'title'];
  } else if (listType === EListType.GROCERY_LIST) {
    sortAttrs = ['product'];
  } else if (listType === EListType.MUSIC_LIST) {
    sortAttrs = ['artist', 'album', 'title'];
  } else if (listType === EListType.SIMPLE_LIST) {
    sortAttrs = ['created_at', 'content'];
  } else {
    sortAttrs = ['due_by', 'assignee_id', 'task'];
  }
  const sorted = performSort(items, sortAttrs);
  return sorted;
}

function handleFailure(
  error: AxiosError,
  notFoundMessage: string,
  navigate: (url: string) => void,
  redirectURI: string,
): void {
  if (error.response) {
    if (error.response.status === 401) {
      toast('You must sign in', {
        type: 'error',
      });
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

interface IFetchListReturn {
  currentUserId: string;
  list: IList;
  purchasedItems: IListItem[];
  categories: string[];
  listUsers: IListUser[];
  includedCategories: string[];
  notPurchasedItems: Record<string, IListItem[]>;
  permissions: string;
}

export async function fetchList(fetchParams: {
  id: string;
  navigate: (url: string) => void;
}): Promise<IFetchListReturn | undefined> {
  try {
    const { data } = await axios.get(`/lists/${fetchParams.id}`);
    const includedCategories = mapIncludedCategories(data.not_purchased_items);
    const notPurchasedItems = categorizeNotPurchasedItems(data.not_purchased_items, includedCategories);

    return {
      currentUserId: data.current_user_id,
      list: data.list,
      purchasedItems: data.purchased_items,
      categories: data.categories,
      listUsers: data.list_users,
      includedCategories,
      notPurchasedItems,
      permissions: data.permissions,
    };
  } catch (err: unknown) {
    handleFailure(err as AxiosError, 'List not found', fetchParams.navigate, '/lists');
  }
}

export async function fetchItemToEdit(fetchParams: {
  itemId: string;
  listId: string;
  navigate: (url: string) => void;
}): Promise<{ listUsers: IListUser[]; userId: string; list: IList; item: IListItem } | undefined> {
  try {
    const { data } = await axios.get(`/lists/${fetchParams.listId}/list_items/${fetchParams.itemId}/edit`);
    data.list.categories = data.categories;
    const userId = data.item.user_id;
    return {
      listUsers: data.list_users,
      userId,
      list: data.list,
      item: data.item,
    };
  } catch (err: unknown) {
    handleFailure(err as AxiosError, 'Item not found', fetchParams.navigate, `/lists/${fetchParams.listId}`);
  }
}

interface IFetchItemsToEditReturn {
  list: IList;
  lists: IList[];
  items: IListItem[];
  categories: string[];
  list_users: IListUser[];
}

export async function fetchItemsToEdit(fetchParams: {
  listId: string;
  search: string;
  navigate: (url: string) => void;
}): Promise<IFetchItemsToEditReturn | undefined> {
  try {
    const { data } = await axios.get(`/lists/${fetchParams.listId}/list_items/bulk_update${fetchParams.search}`);
    return data;
  } catch (err: unknown) {
    handleFailure(
      err as AxiosError,
      'One or more items not found',
      fetchParams.navigate,
      `/lists/${fetchParams.listId}`,
    );
  }
}
