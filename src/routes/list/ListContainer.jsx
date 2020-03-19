import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import axios from 'axios';

import * as config from '../../config/default';
import { listTypeToSnakeCase } from '../../utils/format';
import Alert from '../../components/Alert';
import ListItemForm from './components/ListItemForm';
import ListItemsContainer from './components/ListItemsContainer';
import ConfirmModal from '../../components/ConfirmModal';
import { setUserInfo } from '../../utils/auth';

const mapIncludedCategories = (items) => {
  const cats = [''];
  items.forEach((item) => {
    if (!item.category) return;
    const cat = item.category.toLowerCase();
    if (!cats.includes(cat)) cats.push(cat);
  });
  return cats;
};

const categorizeNotPurchasedItems = (items, categories) => {
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
};


const performSort = (items, sortAttrs) => {
  if (sortAttrs.length === 0) return items;
  const sortAttr = sortAttrs.pop();
  const sorted = items.sort((a, b) => {
    // the sort from the server comes back with items with number_in_series: `null` at the end of the list
    // without the next two lines this would put those items at the front of the list
    if (a[sortAttr] === null) return 1;
    if (b[sortAttr] === null) return -1;
    const positiveBranch = (a[sortAttr] > b[sortAttr]) ? 1 : 0;
    return (a[sortAttr] < b[sortAttr]) ? -1 : positiveBranch;
  });
  return performSort(sorted, sortAttrs);
};

function ListContainer(props) {
  const [userId, setUserId] = useState(0);
  const [list, setList] = useState({
    id: 0,
    type: 'GroceryList',
  });
  const [notPurchasedItems, setNotPurchasedItems] = useState({});
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [listUsers, setListUsers] = useState([]);
  const [permission, setPermission] = useState('write');
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('');
  const [includedCategories, setIncludedCategories] = useState(['']);
  const [errors, setErrors] = useState('');
  const [itemToDelete, setItemToDelete] = useState(false);
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (props.match) {
      axios.get(`${config.apiBase}/lists/${props.match.params.id}/users_lists`, {
        headers: JSON.parse(sessionStorage.getItem('user')),
      }).then(({ data:{ accepted, pending }, headers }) => {
        setUserInfo(headers);
        axios.get(`${config.apiBase}/lists/${props.match.params.id}`, {
          headers: JSON.parse(sessionStorage.getItem('user')),
        }).then(({ data, headers: headers2 }) => {
          setUserInfo(headers2);
          setUserId(data.current_user_id);
          const userInAccepted = accepted.find(acceptedList => acceptedList.user.id === data.current_user_id);
          const allAcceptedUsers = accepted.map(({ user }) => user);
          const allPendingUsers = pending.map(({ user }) => user);
          const responseListUsers = allAcceptedUsers.concat(allPendingUsers);
          if (userInAccepted) {
            const responseIncludedCategories = mapIncludedCategories(data.not_purchased_items);
            const responseNotPurchasedItems = categorizeNotPurchasedItems(
              data.not_purchased_items,
              responseIncludedCategories,
            );
            setUserId(data.current_user_id);
            setList(data.list);
            setPurchasedItems(data.purchased_items); // TODO: need to sort?
            setCategories(data.categories);
            setListUsers(responseListUsers);
            setIncludedCategories(responseIncludedCategories);
            setNotPurchasedItems(responseNotPurchasedItems); // TODO: need to sort?
            setPermission(userInAccepted.users_list.permissions);
          } else {
            props.history.push('/lists');
          }
        });
      }).catch(({ response, request, message }) => {
        if (response) {
          setUserInfo(response.headers);
          if (response.status === 401) {
            // TODO: how do we pass error messages along?
            props.history.push('/users/sign_in');
          } else {
            // TODO: how do we pass error messages along?
            props.history.push('/lists');
          }
        } else if (request) {
          // TODO: what do here?
        } else {
          setErrors(message);
        }
      });
    } else {
      props.history.push('/lists');
    }
  }, [props.history, props.match]);

  const sortItems = (items) => {
    let sortAttrs = [];
    if (list.type === 'BookList') {
      sortAttrs = ['author', 'number_in_series', 'title'];
    } else if (list.type === 'GroceryList') {
      sortAttrs = ['product'];
    } else if (list.type === 'MusicList') {
      sortAttrs = ['artist', 'album', 'title'];
    } else if (list.type === 'ToDoList') {
      sortAttrs = ['due_by', 'assignee_id', 'task'];
    }
    const sorted = performSort(items, sortAttrs);
    return sorted;
  };

  // TODO: refactor? there has got to be a better way
  const handleAddItem = (item) => {
    const category = item.category || '';
    const updatedNotPurchasedItems = notPurchasedItems;
    setNotPurchasedItems({});
    if (!updatedNotPurchasedItems[category]) updatedNotPurchasedItems[category] = [];
    updatedNotPurchasedItems[category] = sortItems(update(updatedNotPurchasedItems[category], { $push: [item] }));
    setNotPurchasedItems(updatedNotPurchasedItems);
    if (!categories.includes(category)) {
      const cats = update(categories, { $push: [category] });
      setCategories(cats);
    }
    if (!includedCategories.includes(category)) {
      const includedCats = update(includedCategories, { $push: [category] });
      setIncludedCategories(includedCats);
    }
  };

  const listId = item => item[`${listTypeToSnakeCase(list.type)}_id`];
  const listItemPath = item => `${config.apiBase}/lists/${listId(item)}/${listTypeToSnakeCase(list.type)}_items`;

  // TODO: refactor?
  const moveItemToPurchased = (item) => {
    let { category } = item;
    if (!category) category = '';
    const updatedNotPurchasedItems = notPurchasedItems[category].filter(notItem => notItem.id !== item.id);
    notPurchasedItems[category] = updatedNotPurchasedItems;
    const updatedPurchasedItems = update(purchasedItems, { $push: [item] });
    setPurchasedItems(sortItems(updatedPurchasedItems));
    if (!notPurchasedItems[category].length) {
      setIncludedCategories(includedCategories.filter(cat => cat !== category));
      setFilter('');
    }
  };

  const dismissAlert = () => {
    setSuccess('');
    setErrors('');
  };

  const failure = (response, request, message) => {
    if (response) {
      setUserInfo(response.headers);
      if (response.status === 401) {
        // TODO: how do we pass error messages along?
        props.history.push('/users/sign_in');
      } else if (response.status === 403) {
        // TODO: how do we pass error messages along?
        props.history.push('/lists');
      } else {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map(key => `${key} ${response.data[key]}`);
        setErrors(responseErrors.join(' and '));
      }
    } else if (request) {
      // TODO: what do here?
    } else {
      setErrors(message);
    }
  };

  const handleItemPurchase = (item) => {
    dismissAlert();
    const completionType = list.type === 'ToDoList' ? 'completed' : 'purchased';
    axios.put(
      `${listItemPath(item)}/${item.id}`,
      `${listTypeToSnakeCase(list.type)}_item%5B${completionType}%5D=true`,
      {
        headers: JSON.parse(sessionStorage.getItem('user')),
      },
    ).then(({ headers }) => {
      setUserInfo(headers);
      moveItemToPurchased(item);
      setSuccess('Item successfully purchased.');
    }).catch(({ response, request, message }) => {
      failure(response, request, message);
    });
  };

  const handleItemRead = (item) => {
    const localItem = item;
    localItem.read = true;
    dismissAlert();
    axios.put(`${listItemPath(item)}/${item.id}`, `${listTypeToSnakeCase(list.type)}_item%5Bread%5D=true`, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ headers }) => {
      setUserInfo(headers);
      setSuccess('Item successfully read.');
    }).fail(({ response, request, message }) => {
      failure(response, request, message);
    });
  };

  const handleItemUnRead = (item) => {
    const localItem = item;
    localItem.read = false;
    dismissAlert();
    axios.put(`${listItemPath(item)}/${item.id}`, `${listTypeToSnakeCase(list.type)}_item%5Bread%5D=false`, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ headers }) => {
      setUserInfo(headers);
      setSuccess('Item successfully unread.');
    }).catch(({ response, request, message }) => {
      failure(response, request, message);
    });
  };

  const handleUnPurchase = (item) => {
    dismissAlert();
    const newItem = {
      user_id: item.user_id,
      product: item.product,
      task: item.task,
      quantity: item.quantity,
      purchased: false,
      completed: false,
      assignee_id: item.assignee_id,
      due_by: item.due_by,
      category: item.category || '',
    };
    newItem[`${listTypeToSnakeCase(list.type)}_id`] = listId(item);
    const postData = {};
    postData[`${listTypeToSnakeCase(list.type)}_item`] = newItem;
    // TODO: these should be in a Promise.all, centralize failures
    axios.post(`${listItemPath(newItem)}`, postData, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ data, headers }) => {
      setUserInfo(headers);
      handleAddItem(data);
    }).catch(({ response, request, message }) => {
      failure(response, request, message);
    });
    axios.put(`${listItemPath(item)}/${item.id}`, `${listTypeToSnakeCase(list.type)}_item%5Brefreshed%5D=true`, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ headers }) => {
      setUserInfo(headers);
      const updatedPurchasedItems = purchasedItems.filter(notItem => notItem.id !== item.id);
      setPurchasedItems(sortItems(updatedPurchasedItems));
      setSuccess('Item successfully refreshed.');
    }).catch(({ response, request, message }) => {
      failure(response, request, message);
    });
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    dismissAlert();
    axios.delete(`${listItemPath(itemToDelete)}/${itemToDelete.id}`, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ headers }) => {
      setUserInfo(headers);
      setShowDeleteConfirm(false);
      setSuccess('Item successfully deleted.');
      // TODO: can this be handled by manipulating the state?
      // should just be able to remove the item from purchased or not purchased
      // if it was the last item of a category that category should be removed? (check server for what its returning)
      axios.get(`${config.apiBase}/lists/${props.match.params.id}`, {
        headers: JSON.parse(sessionStorage.getItem('user')),
      }).then(({ data, headers }) => {
        setUserInfo(headers);
        const responseIncludedCategories = mapIncludedCategories(data.not_purchased_items);
        const responseNotPurchasedItems = categorizeNotPurchasedItems(
          data.not_purchased_items,
          responseIncludedCategories,
        );
        setIncludedCategories(responseIncludedCategories);
        setNotPurchasedItems(responseNotPurchasedItems); // TODO: need to sort?
        setPurchasedItems(data.purchased_items); // TODO: need to sort?
      }).catch(({ response, request, message }) => {
        failure(response, request, message);
      });
    }).catch(({ response, request, message }) => {
      failure(response, request, message);
    });
  };

  return (
    <>
      <h1>{ list.name }</h1>
      <Link to="/lists" className="float-right">Back to lists</Link>
      <Alert errors={errors} success={success} handleDismiss={dismissAlert} />
      <br />
      {
        permission === 'write' ? <ListItemForm
          listId={list.id}
          listType={list.type}
          listUsers={listUsers}
          userId={userId}
          handleItemAddition={handleAddItem}
          categories={categories}
        /> : <p>You only have permission to read this list</p>
      }
      <br />
      <ListItemsContainer
        notPurchasedItems={notPurchasedItems}
        purchasedItems={purchasedItems}
        handlePurchaseOfItem={handleItemPurchase}
        handleReadOfItem={handleItemRead}
        handleUnReadOfItem={handleItemUnRead}
        handleItemDelete={handleDelete}
        handleItemUnPurchase={handleUnPurchase}
        listType={list.type}
        listUsers={listUsers}
        permission={permission}
        handleCategoryFilter={({ target: { name } }) => setFilter(name)}
        handleClearFilter={() => setFilter('')}
        filter={filter}
        categories={includedCategories}
      />
      <ConfirmModal
        action="delete"
        body="Are you sure you want to delete this item?"
        show={showDeleteConfirm}
        handleConfirm={() => handleDeleteConfirm()}
        handleClear={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

ListContainer.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      list_id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default ListContainer;
