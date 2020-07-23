import { toast } from 'react-toastify';

import axios from '../../utils/api';
import { formatDueBy } from '../../utils/format';

export function itemName(item, listType) {
  return {
    BookList: `${item.title ? `"${item.title}"` : ''} ${item.author || ''}`,
    GroceryList: `${item.quantity || ''} ${item.product || ''}`,
    MusicList:
      `${item.title ? `"${item.title}"` : ''} ${item.artist || ''}` +
      `${item.artist && item.album ? ' - ' : ''}${item.album || ''}`,
    ToDoList: `${item.task}`,
  }[listType].trim();
}

export function mapIncludedCategories(items) {
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

export function categorizeNotPurchasedItems(items, categories) {
  const obj = {};
  categories.forEach((cat) => {
    obj[cat] = [];
  });
  items.forEach((item) => {
    if (!item.category) {
      obj[''].push(item);
      return;
    }
    const cat = item.category.toLowerCase();
    if (!obj[cat]) {
      obj[cat] = [];
    }
    obj[cat].push(item);
  });
  return obj;
}

function performSort(items, sortAttrs) {
  // return when all items are sorted
  if (sortAttrs.length === 0) {
    return items;
  }
  const sortAttr = sortAttrs.pop();
  const sorted = items.sort((a, b) => {
    // the sort from the server comes back with items with number_in_series: `null` at the end of the list
    // without the next two lines this would put those items at the front of the list
    if (a[sortAttr] === null) {
      return 1;
    }
    if (b[sortAttr] === null) {
      return -1;
    }
    const positiveBranch = a[sortAttr] > b[sortAttr] ? 1 : 0;
    return a[sortAttr] < b[sortAttr] ? -1 : positiveBranch;
  });
  return performSort(sorted, sortAttrs);
}

export function sortItems(listType, items) {
  let sortAttrs = [];
  if (listType === 'BookList') {
    sortAttrs = ['author', 'number_in_series', 'title'];
  } else if (listType === 'GroceryList') {
    sortAttrs = ['product'];
  } else if (listType === 'MusicList') {
    sortAttrs = ['artist', 'album', 'title'];
  } else if (listType === 'ToDoList') {
    sortAttrs = ['due_by', 'assignee_id', 'task'];
  }
  const sorted = performSort(items, sortAttrs);
  return sorted;
}

export async function fetchList({ id, history }) {
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
  } catch ({ response }) {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        history.push('/users/sign_in');
        return;
      } else if ([403, 404].includes(response.status)) {
        toast('List not found', { type: 'error' });
        history.push('/lists');
        return;
      }
    }
    // any other errors we will catch and render generic UnknownError
    throw new Error();
  }
}

export async function fetchItemToEdit({ itemId, listId, itemType, history }) {
  try {
    const {
      data: {
        item,
        list: { id: returnedListId, type },
        categories,
        list_users,
      },
    } = await axios.get(`/lists/${listId}/${itemType}/${itemId}/edit`);
    // TODO: why? can these just be optional?
    const userId = item.user_id;
    const returnedItemId = item.id;
    const product = item.product || '';
    const task = item.task || '';
    const purchased = item.purchased || false;
    const quantity = item.quantity || '';
    const completed = item.completed || false;
    const author = item.author || '';
    const title = item.title || '';
    const read = item.read || false;
    const artist = item.artist || '';
    const album = item.album || '';
    const dueBy = item.due_by ? formatDueBy(item.due_by) : '';
    const assigneeId = item.assignee_id ? String(item.assignee_id) : '';
    const numberInSeries = item.number_in_series ? Number(item.number_in_series) : 0;
    const category = item.category || '';
    return {
      listUsers: list_users || [],
      userId,
      list: {
        id: returnedListId,
        type,
        categories,
      },
      item: {
        id: returnedItemId,
        product,
        task,
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
  } catch ({ response }) {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        history.push('/users/sign_in');
        return;
      } else if ([403, 404].includes(response.status)) {
        toast('Item not found', { type: 'error' });
        history.push(`/lists/${listId}`);
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}

export async function fetchItemsToEdit({ listId, itemType, search, history }) {
  try {
    const { data } = await axios.get(`/lists/${listId}/${itemType}/bulk_update${search}`);
    return data;
  } catch ({ response }) {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        history.push('/users/sign_in');
        return;
      } else if ([403, 404].includes(response.status)) {
        toast('One or more items not found', { type: 'error' });
        history.push(`/lists/${listId}`);
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}
