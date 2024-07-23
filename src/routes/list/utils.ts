import { toast } from 'react-toastify';

import axios from '../../utils/api';
import { formatDueBy } from '../../utils/format';
import { EListType, IListItem } from '../../typings';
import { IListITemsFormFieldsFormDataProps } from './components/ListItemFormFields';

export function itemName(item: IListItem | IListITemsFormFieldsFormDataProps, listType: EListType) {
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

export function mapIncludedCategories(items: IListItem[]) {
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

export function categorizeNotPurchasedItems(items: IListItem[], categories: string[]) {
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

function performSort(items: IListItem[], sortAttrs: (keyof IListItem)[]) {
  // return when all items are sorted
  if (sortAttrs.length === 0) {
    return items;
  }
  const sortAttr = sortAttrs.pop()!;
  const sorted = items.sort((a, b) => {
    // the sort from the server comes back with items with number_in_series: `null` at the end of the list
    // without the next two lines this would put those items at the front of the list
    if (!a[sortAttr]) {
      return 1;
    }
    if (!b[sortAttr]) {
      return -1;
    }
    const positiveBranch = a[sortAttr] > b[sortAttr] ? 1 : 0;
    return a[sortAttr] < b[sortAttr] ? -1 : positiveBranch;
  });
  return performSort(sorted, sortAttrs);
}

export function sortItems(listType: EListType, items: IListItem[]) {
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

export async function fetchList({ id, navigate }: { id: string; navigate: (url: string) => void }) {
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
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 401) {
        toast('You must sign in', {
          type: 'error',
        });
        navigate('/users/sign_in');
        return;
      } else if ([403, 404].includes(err.response.status)) {
        toast('List not found', {
          type: 'error',
        });
        navigate('/lists');
        return;
      }
    }
    // any other errors we will catch and render generic UnknownError
    throw new Error(err);
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
}) {
  try {
    const {
      data: { item, list, categories, list_users },
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
      listUsers: list_users || [],
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
        dueBy,
        assigneeId,
        album,
        numberInSeries,
        category,
      },
    };
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 401) {
        toast('You must sign in', {
          type: 'error',
        });
        navigate('/users/sign_in');
        return;
      } else if ([403, 404].includes(err.response.status)) {
        toast('Item not found', {
          type: 'error',
        });
        navigate(`/lists/${listId}`);
        return;
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
}) {
  try {
    const { data } = await axios.get(`/lists/${listId}/list_items/bulk_update${search}`);
    return data;
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === 401) {
        toast('You must sign in', {
          type: 'error',
        });
        navigate('/users/sign_in');
        return;
      } else if ([403, 404].includes(err.response.status)) {
        toast('One or more items not found', {
          type: 'error',
        });
        navigate(`/lists/${listId}`);
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}
