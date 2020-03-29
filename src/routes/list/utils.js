import axios from '../../utils/api';
import { formatDueBy } from '../../utils/format';

export function mapIncludedCategories(items) {
  const cats = [''];
  items.forEach(item => {
    if (!item.category) return;
    const cat = item.category.toLowerCase();
    if (!cats.includes(cat)) cats.push(cat);
  });
  return cats;
}

export function categorizeNotPurchasedItems(items, categories) {
  const obj = {};
  categories.forEach(cat => {
    obj[cat] = [];
  });
  items.forEach(item => {
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
    const userInAccepted = accepted.find(acceptedList => acceptedList.user.id === currentUserId);
    if (!userInAccepted) {
      history.push('/lists');
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
          state: { errors: 'You must sign in' },
        });
      } else {
        // TODO: how do we pass error messages along?
        history.push('/lists');
      }
    } else {
      // TODO: how do we pass error messages along?
      history.push('/lists');
    }
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
      history.push('/lists');
      return;
    }
    return {
      listId,
      name,
      completed,
      type,
    };
  } catch ({ response, request, message }) {
    const newError = new Error();
    if (response) {
      if (response.status === 401) {
        history.push({
          pathname: '/users/sign_in',
          state: { errors: 'You must sign in' },
        });
      } else {
        // TODO: how do we pass error messages along?
        history.push('/lists');
      }
    } else if (request) {
      newError.message = 'Something went wrong!';
    } else {
      newError.message = message;
    }
    throw newError;
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
        item: {
          user_id: userId,
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
          due_by,
          album,
          category: itemCategory,
          assignee_id,
          number_in_series,
        },
        list: { id: returnedListId, type },
      },
    } = editListResponse;
    const {
      data: { accepted, pending, current_user_id: currentUserId },
    } = usersListsResponse;
    const {
      data: { categories },
    } = listResponse;
    const dueBy = formatDueBy(due_by);
    const acceptedUsers = accepted.map(({ user }) => user);
    const pendingUsers = pending.map(({ user }) => user);
    const listUsers = acceptedUsers.concat(pendingUsers);
    const userInAccepted = accepted.find(acceptedList => acceptedList.user.id === currentUserId);
    const assigneeId = assignee_id ? String(assignee_id) : '';
    const numberInSeries = Number(number_in_series);
    const category = itemCategory || '';
    if (!userInAccepted || userInAccepted.users_list.permissions !== 'write') {
      // TODO: how do we pass errors around?
      history.push('/lists');
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
          state: { errors: 'You must sign in' },
        });
      } else {
        // TODO: how do we pass error messages along?
        history.push(`/lists/${listId}`);
      }
    } else {
      // TODO: how do we pass error messages along?
      history.push(`/lists/${listId}`);
    }
  }
}
