import axios from '../../utils/api';
import { formatDueBy } from '../../utils/format';

export function itemName(item, listType) {
  return {
    BookList: `${item.title ? `"${item.title}"` : ''} ${item.author}`,
    GroceryList: `${item.quantity} ${item.product}`,
    MusicList:
      `${item.title ? `"${item.title}"` : ''} ${item.artist} ` +
      `${item.artist && item.album ? '- ' : ''}` +
      `${item.album ? item.album : ''}`,
    ToDoList: `${item.task}`,
  }[listType];
}

export function mapIncludedCategories(items) {
  const cats = [''];
  items.forEach((item) => {
    if (!item.category) return;
    const cat = item.category.toLowerCase();
    if (!cats.includes(cat)) cats.push(cat);
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
    if (!obj[cat]) obj[cat] = [];
    obj[cat].push(item);
  });
  return obj;
}

export function performSort(items, sortAttrs) {
  if (sortAttrs.length === 0) return items;
  const sortAttr = sortAttrs.pop();
  const sorted = items.sort((a, b) => {
    // the sort from the server comes back with items with number_in_series: `null` at the end of the list
    // without the next two lines this would put those items at the front of the list
    if (a[sortAttr] === null) return 1;
    if (b[sortAttr] === null) return -1;
    const positiveBranch = a[sortAttr] > b[sortAttr] ? 1 : 0;
    return a[sortAttr] < b[sortAttr] ? -1 : positiveBranch;
  });
  return performSort(sorted, sortAttrs);
}

export async function fetchList({ id, history }) {
  try {
    const responses = await Promise.all([axios.get(`/lists/${id}/users_lists`), axios.get(`/lists/${id}`)]);
    const [
      {
        data: { accepted, pending },
      },
      {
        data: {
          current_user_id: currentUserId,
          not_purchased_items: responseNotPurchasedItems,
          purchased_items: purchasedItems,
          list,
          categories,
        },
      },
    ] = responses;
    const userInAccepted = accepted.find((acceptedList) => acceptedList.user.id === currentUserId);
    if (!userInAccepted) {
      history.push({
        pathname: '/lists',
        state: {
          error: 'List not found',
        },
      });
      return;
    }
    const allAcceptedUsers = accepted.map(({ user }) => user);
    const allPendingUsers = pending.map(({ user }) => user);
    const listUsers = allAcceptedUsers.concat(allPendingUsers);
    const includedCategories = mapIncludedCategories(responseNotPurchasedItems);
    const notPurchasedItems = categorizeNotPurchasedItems(responseNotPurchasedItems, includedCategories);
    const { permissions } = userInAccepted.users_list;

    return {
      currentUserId,
      list,
      purchasedItems, // TODO: need to sort?
      categories,
      listUsers,
      includedCategories,
      notPurchasedItems, // TODO: need to sort?
      permissions,
    };
  } catch ({ response }) {
    if (response) {
      if (response.status === 401) {
        history.push({
          pathname: '/users/sign_in',
          state: {
            errors: 'You must sign in',
          },
        });
        return;
      } else if ([403, 404].includes(response.status)) {
        history.push({
          pathname: '/lists',
          state: {
            errors: 'List not found',
          },
        });
        return;
      }
    }
    // any other errors we will catch and render generic UnknownError
    throw new Error();
  }
}

export async function fetchListToEdit({ id, history }) {
  try {
    const {
      data: {
        list: { owner_id, id: listId, name, completed, type },
        current_user_id: currentUserId,
      },
    } = await axios.get(`/lists/${id}/edit`);
    if (owner_id !== currentUserId) {
      history.push({
        pathname: '/lists',
        state: {
          errors: 'List not found',
        },
      });
      return;
    }
    return {
      listId,
      name,
      completed,
      type,
    };
  } catch ({ response, request, message }) {
    if (response) {
      if (response.status === 401) {
        history.push({
          pathname: '/users/sign_in',
          state: {
            errors: 'You must sign in',
          },
        });
        return;
      } else if ([403, 404].includes(response.status)) {
        history.push({
          pathname: '/lists',
          state: {
            errors: 'List not found',
          },
        });
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}

export async function fetchItemToEdit({ itemId, listId, itemType, history }) {
  try {
    // TODO: do i need all of this?
    const [editListResponse, usersListsResponse, listResponse] = await Promise.all([
      axios.get(`/lists/${listId}/${itemType}/${itemId}/edit`),
      axios.get(`/lists/${listId}/users_lists`),
      axios.get(`/lists/${listId}`),
    ]);
    const {
      data: {
        item,
        list: { id: returnedListId, type },
      },
    } = editListResponse;
    const {
      data: { accepted, pending, current_user_id: currentUserId },
    } = usersListsResponse;
    const {
      data: { categories },
    } = listResponse;
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
    const dueBy = formatDueBy(item.due_by);
    const acceptedUsers = accepted.map(({ user }) => user);
    const pendingUsers = pending.map(({ user }) => user);
    const listUsers = acceptedUsers.concat(pendingUsers);
    const userInAccepted = accepted.find((acceptedList) => acceptedList.user.id === currentUserId);
    const assigneeId = item.assignee_id ? String(item.assignee_id) : '';
    const numberInSeries = item.number_in_series ? Number(item.number_in_series) : 0;
    const category = item.category || '';
    if (!userInAccepted || userInAccepted.users_list.permissions !== 'write') {
      history.push({
        pathname: `/lists/${listId}`,
        state: {
          errors: 'List not found',
        },
      });
      return;
    }
    return {
      listUsers,
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
        history.push({
          pathname: '/users/sign_in',
          state: {
            errors: 'You must sign in',
          },
        });
        return;
      } else if ([403, 404].includes(response.status)) {
        history.push({
          pathname: `/lists/${listId}`,
          state: {
            errors: 'Item not found',
          },
        });
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}
