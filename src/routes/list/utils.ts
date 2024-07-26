import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from '../../utils/api';
import { formatDueBy } from '../../utils/format';
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

export async function fetchList({ id, navigate }: { id: string; navigate: (url: string) => void }): Promise<
  | {
      currentUserId: string;
      list: IList;
      purchasedItems: IListItem[];
      categories: string[];
      listUsers: IListUser;
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
    const error = err as AxiosError;
    if (error.response) {
      if (error.response.status === 401) {
        toast('You must sign in', {
          type: 'error',
        });
        navigate('/users/sign_in');
        return;
      } else if ([403, 404].includes(error.response.status)) {
        toast('List not found', {
          type: 'error',
        });
        navigate('/lists');
        return;
      }
    }
    // any other errors we will catch and render generic UnknownError
    throw new Error(JSON.stringify(error));
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
}): Promise<{ listUsers: IListUser[]; userId: string; list: IList; item: IListItem }> {
  try {
    const {
      data: { item, list, categories, list_users: listUsers },
    } = await axios.get(`/lists/${listId}/list_items/${itemId}/edit`);
    list.categories = categories;
    // TODO: why? can these just be optional?
    const userId = item.user_id;
    const returnedItemId = item.id;
    const product = item.product || '';
    const task = item.task || '';
    const content = item.content || '';
    const purchased = item.purchased || false;
    const quantity = item.quantity || '';
    const completed = item.completed || false;
    const author = item.author || '';
    const title = item.title || '';
    const read = item.read || false;
    const artist = item.artist || '';
    const album = item.album || '';
    const dueBy = formatDueBy(item.due_by);
    const assigneeId = item.assignee_id ? String(item.assignee_id) : '';
    const numberInSeries = item.number_in_series ? Number(item.number_in_series) : 0;
    const category = item.category || '';
    return {
      listUsers: listUsers || [],
      userId,
      list,
      item: {
        id: returnedItemId,
        product,
        task,
        content,
        purchased,
        quantity,
        completed,
        author,
        title,
        read,
        artist,
        due_by: dueBy,
        assignee_id: assigneeId,
        album,
        number_in_series: numberInSeries,
        category,
      },
    };
  } catch (err: unknown) {
    const error = err as AxiosError;
    if (error.response) {
      if (error.response.status === 401) {
        toast('You must sign in', {
          type: 'error',
        });
        navigate('/users/sign_in');
      } else if ([403, 404].includes(error.response.status)) {
        toast('Item not found', {
          type: 'error',
        });
        navigate(`/lists/${listId}`);
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
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
}): Promise<{ list: IList; lists: IList[]; items: IListItem[]; categories: string[]; list_users: IListUser[] }> {
  try {
    const { data } = await axios.get(`/lists/${listId}/list_items/bulk_update${search}`);
    return data;
  } catch (err: unknown) {
    const error = err as AxiosError;
    if (error.response) {
      if (error.response.status === 401) {
        toast('You must sign in', {
          type: 'error',
        });
        navigate('/users/sign_in');
      } else if ([403, 404].includes(error.response.status)) {
        toast('One or more items not found', {
          type: 'error',
        });
        navigate(`/lists/${listId}`);
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}
