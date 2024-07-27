import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from '../../utils/api';
import { EListType, type IList, type IListItem, type IListUser } from '../../typings';
import type { IListITemsFormFieldsFormDataProps } from './components/ListItemFormFields';

export function itemName(item: IListItem | IListITemsFormFieldsFormDataProps, listType: EListType): string | undefined {
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

export async function fetchList({ id, navigate }: { id: string; navigate: (url: string) => void }): Promise<
  | {
      currentUserId: string;
      list: IList;
      purchasedItems: IListItem[];
      categories: string[];
      listUsers: IListUser[];
      includedCategories: string[];
      notPurchasedItems: Record<string, IListItem[]>;
      permissions: string;
    }
  | undefined
> {
  try {
    const {
      data: {
        current_user_id: currentUserId,
        not_purchased_items: responseNotPurchasedItems,
        purchased_items: purchasedItems,
        list,
        categories,
        permissions,
        list_users: listUsers,
      },
    } = await axios.get(`/lists/${id}`);
    const includedCategories = mapIncludedCategories(responseNotPurchasedItems);
    const notPurchasedItems = categorizeNotPurchasedItems(responseNotPurchasedItems, includedCategories);

    return {
      currentUserId,
      list,
      purchasedItems,
      categories,
      listUsers,
      includedCategories,
      notPurchasedItems,
      permissions,
    };
  } catch (err: unknown) {
    handleFailure(err as AxiosError, 'List not found', navigate, '/lists');
  }
}

export async function fetchItemToEdit({
  itemId,
  listId,
  navigate,
}: {
  itemId: string;
  listId: string;
  navigate: (url: string) => void;
}): Promise<{ listUsers: IListUser[]; userId: string; list: IList; item: IListItem } | undefined> {
  try {
    const {
      data: { item, list, categories, list_users: listUsers },
    } = await axios.get(`/lists/${listId}/list_items/${itemId}/edit`);
    list.categories = categories;
    const userId = item.user_id;
    return {
      listUsers: listUsers,
      userId,
      list,
      item,
    };
  } catch (err: unknown) {
    handleFailure(err as AxiosError, 'Item not found', navigate, `/lists/${listId}`);
  }
}

export async function fetchItemsToEdit({
  listId,
  search,
  navigate,
}: {
  listId: string;
  search: string;
  navigate: (url: string) => void;
}): Promise<
  { list: IList; lists: IList[]; items: IListItem[]; categories: string[]; list_users: IListUser[] } | undefined
> {
  try {
    const { data } = await axios.get(`/lists/${listId}/list_items/bulk_update${search}`);
    return data;
  } catch (err: unknown) {
    handleFailure(err as AxiosError, 'One or more items not found', navigate, `/lists/${listId}`);
  }
}
