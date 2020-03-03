import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import * as $ from 'jquery';

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

  useEffect(() => {
    if (props.match) {
      $.ajax({
        type: 'GET',
        url: `${config.apiBase}/lists/${props.match.params.id}`,
        dataType: 'JSON',
        headers: JSON.parse(sessionStorage.getItem('user')),
      }).done((data, _status, request1) => {
        setUserInfo(request1);
        setUserId(data.current_user_id);
        $.ajax({
          type: 'GET',
          url: `${config.apiBase}/lists/${props.match.params.id}/users_lists`,
          dataType: 'JSON',
          headers: JSON.parse(sessionStorage.getItem('user')),
        }).done(({ accepted, pending }, _status, request2) => {
          setUserInfo(request2)
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
      }).fail(({ responseText }) => {
        console.error(JSON.parse(responseText).errors);
        props.history.push('/users/sign_in')
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
    updatedNotPurchasedItems[category] = update(updatedNotPurchasedItems[category], { $push: [item] });
    setNotPurchasedItems(sortItems(updatedNotPurchasedItems));
    if (!categories.includes(category)) {
      const cats = update(categories, { $push: [category] });
      setCategories(cats);
    }
    if (!includedCategories.includes(category)) {
      const iCats = update(includedCategories, { $push: [category] });
      setIncludedCategories(iCats);
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

  const failure = (responseText) => {
    const responseJSON = JSON.parse(responseText);
    const responseTextKeys = Object.keys(responseJSON);
    const responseErrors = responseTextKeys.map(key => `${key} ${responseJSON[key]}`);
    setErrors(responseErrors.join(' and '));
  };

  const handleItemPurchase = (item) => {
    dismissAlert();
    let completionType;
    if (list.type === 'ToDoList') {
      completionType = 'completed';
    } else {
      completionType = 'purchased';
    }
    $.ajax({
      url: `${listItemPath(item)}/${item.id}`,
      type: 'PUT',
      data: `${listTypeToSnakeCase(list.type)}_item%5B${completionType}%5D=true`,
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done((_data, _status, request) => {
      setUserInfo(request);
      moveItemToPurchased(item);
      setSuccess('Item successfully purchased.');
    }).fail((response) => {
      failure(response.responseText);
    });
  };

  const handleItemRead = (item) => {
    const localItem = item;
    localItem.read = true;
    dismissAlert();
    $.ajax({
      url: `${listItemPath(item)}/${item.id}`,
      type: 'PUT',
      data: `${listTypeToSnakeCase(list.type)}_item%5Bread%5D=true`,
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done((_data, _status, request) => {
      setUserInfo(request);
      setSuccess('Item successfully read.');
    }).fail((response) => {
      failure(response.responseText);
    });
  };

  const handleItemUnRead = (item) => {
    const localItem = item;
    localItem.read = false;
    dismissAlert();
    $.ajax({
      url: `${listItemPath(item)}/${item.id}`,
      type: 'PUT',
      data: `${listTypeToSnakeCase(list.type)}_item%5Bread%5D=false`,
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done((_data, _status, request) => {
      setUserInfo(request);
      setSuccess('Item successfully unread.');
    }).fail((response) => {
      failure(response.responseText);
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
    $.ajax({
      url: `${listItemPath(newItem)}`,
      type: 'POST',
      data: postData,
      headers: JSON.parse(sessionStorage.getItem('user')),
    })
      .done((data, _status, request1) => {
        setUserInfo(request1);
        handleAddItem(data);
        $.ajax({
          url: `${listItemPath(item)}/${item.id}`,
          type: 'PUT',
          data: `${listTypeToSnakeCase(list.type)}_item%5Brefreshed%5D=true`,
          headers: JSON.parse(sessionStorage.getItem('user')),
        })
          .done((_data, _status, request2) => {
            setUserInfo(request2);
            const updatedPurchasedItems = purchasedItems.filter(notItem => notItem.id !== item.id);
            setPurchasedItems(sortItems(updatedPurchasedItems));
            setSuccess('Item successfully refreshed.');
          })
          .fail((response) => {
            failure(response.responseText);
          });
      }).fail((response) => {
        failure(response.responseText);
      });
  };

  const confirmModalId = 'confirm-delete-item-modal';

  const handleDelete = (item) => {
    setItemToDelete(item);
    $(`#${confirmModalId}`).modal('show');
  };

  const handleDeleteConfirm = () => {
    dismissAlert();
    $.ajax({
      url: `${listItemPath(itemToDelete)}/${itemToDelete.id}`,
      type: 'DELETE',
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done((_data, _status, request1) => {
      setUserInfo(request1);
      $.ajax({
        type: 'GET',
        url: `/lists/${props.match.params.id}`,
        dataType: 'JSON',
        headers: JSON.parse(sessionStorage.getItem('user')),
      }).done((data, _status, request2) => {
        setUserInfo(request2);
        $(`#${confirmModalId}`).modal('hide');
        const responseIncludedCategories = mapIncludedCategories(data.not_purchased_items);
        const responseNotPurchasedItems = categorizeNotPurchasedItems(
          data.not_purchased_items,
          responseIncludedCategories,
        );
        setSuccess('Item successfully deleted.');
        setIncludedCategories(responseIncludedCategories);
        setNotPurchasedItems(responseNotPurchasedItems); // TODO: need to sort?
        setPurchasedItems(data.purchased_items); // TODO: need to sort?
      }).fail((response) => {
        failure(response.responseText);
      });
    }).fail((response) => {
      failure(response.responseText);
    });
  };

  return (
    <div>
      <h1>{ list.name }</h1>
      <Link to="/lists" className="pull-right">Back to lists</Link>
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
        name={confirmModalId}
        action="delete"
        body="Are you sure you want to delete this item?"
        handleConfirm={() => handleDeleteConfirm()}
        handleClear={() => $(`#${confirmModalId}`).modal('hide')}
      />
    </div>
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
