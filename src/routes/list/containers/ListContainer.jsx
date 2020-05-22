import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import { listTypeToSnakeCase } from '../../../utils/format';
import ListItemForm from '../components/ListItemForm';
import ConfirmModal from '../../../components/ConfirmModal';
import axios from '../../../utils/api';
import { mapIncludedCategories, categorizeNotPurchasedItems, performSort } from '../utils';
import ListItems from '../components/ListItems';
import CategoryFilter from '../components/CategoryFilter';

function ListContainer(props) {
  const [notPurchasedItems, setNotPurchasedItems] = useState(props.notPurchasedItems);
  const [purchasedItems, setPurchasedItems] = useState(props.purchasedItems);
  const [categories, setCategories] = useState(props.categories);
  const [filter, setFilter] = useState('');
  const [includedCategories, setIncludedCategories] = useState(props.includedCategories);
  const [itemToDelete, setItemToDelete] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const sortItems = (items) => {
    let sortAttrs = [];
    if (props.list.type === 'BookList') {
      sortAttrs = ['author', 'number_in_series', 'title'];
    } else if (props.list.type === 'GroceryList') {
      sortAttrs = ['product'];
    } else if (props.list.type === 'MusicList') {
      sortAttrs = ['artist', 'album', 'title'];
    } else if (props.list.type === 'ToDoList') {
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

  const listId = (item) => item[`${listTypeToSnakeCase(props.list.type)}_id`];
  const listItemPath = (item) => `/lists/${listId(item)}/${listTypeToSnakeCase(props.list.type)}_items`;

  // TODO: refactor?
  const moveItemToPurchased = (item) => {
    let { category } = item;
    if (!category) category = '';
    const updatedNotPurchasedItems = notPurchasedItems[category].filter((notItem) => notItem.id !== item.id);
    notPurchasedItems[category] = updatedNotPurchasedItems;
    const updatedPurchasedItems = update(purchasedItems, { $push: [item] });
    setPurchasedItems(sortItems(updatedPurchasedItems));
    if (!notPurchasedItems[category].length) {
      setIncludedCategories(includedCategories.filter((cat) => cat !== category));
      setFilter('');
    }
  };

  const failure = ({ response, request, message }) => {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        props.history.push('/users/sign_in');
      } else if ([403, 404].includes(response.status)) {
        toast('Item not found', { type: 'error' });
      } else {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
        toast(responseErrors.join(' and '), { type: 'error' });
      }
    } else if (request) {
      toast('Something went wrong', { type: 'error' });
    } else {
      toast(message, { type: 'error' });
    }
  };

  const handleItemPurchase = async (item) => {
    const completionType = props.list.type === 'ToDoList' ? 'completed' : 'purchased';
    try {
      await axios.put(`${listItemPath(item)}/${item.id}`, {
        [`${listTypeToSnakeCase(props.list.type)}_item`]: {
          [completionType]: true,
        },
      });
      moveItemToPurchased(item);
      toast('Item successfully purchased.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const toggleRead = async (item, isRead) => {
    const localItem = item;
    localItem.read = isRead;
    try {
      await axios.put(`${listItemPath(item)}/${item.id}`, {
        [`${listTypeToSnakeCase(props.list.type)}_item`]: {
          read: isRead,
        },
      });
      if (item.purchased) {
        const itemIndex = purchasedItems.findIndex((purchasedItem) => item.id === purchasedItem.id);
        const newItems = [...purchasedItems];
        newItems[itemIndex] = localItem;
        const newPurchasedItems = update(purchasedItems, { $set: newItems });
        setPurchasedItems(newPurchasedItems);
      } else {
        const itemsInCat = notPurchasedItems[item.category];
        const itemIndex = itemsInCat.findIndex((notPurchasedItem) => item.id === notPurchasedItem.id);
        const newItemsInCat = [...itemsInCat];
        newItemsInCat[itemIndex] = localItem;
        const newNotPurchasedItems = update(notPurchasedItems, { [item.category]: { $set: newItemsInCat } });
        setNotPurchasedItems(newNotPurchasedItems);
      }

      toast(`Item successfully ${isRead ? 'read' : 'unread'}.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleItemRead = async (item) => toggleRead(item, true);

  const handleItemUnRead = async (item) => toggleRead(item, false);

  const handleUnPurchase = (item) => {
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
    newItem[`${listTypeToSnakeCase(props.list.type)}_id`] = listId(item);
    const postData = {};
    postData[`${listTypeToSnakeCase(props.list.type)}_item`] = newItem;
    Promise.all([
      axios.post(`${listItemPath(newItem)}`, postData),
      axios.put(`${listItemPath(item)}/${item.id}`, {
        [`${listTypeToSnakeCase(props.list.type)}_item`]: {
          refreshed: true,
        },
      }),
    ])
      .then(([{ data }]) => {
        handleAddItem(data);
        const updatedPurchasedItems = purchasedItems.filter((notItem) => notItem.id !== item.id);
        setPurchasedItems(sortItems(updatedPurchasedItems));
        toast('Item successfully refreshed.', { type: 'info' });
      })
      .catch(failure);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${listItemPath(itemToDelete)}/${itemToDelete.id}`);
      setShowDeleteConfirm(false);
      const { data } = await axios.get(`/lists/${props.id}`);
      const responseIncludedCategories = mapIncludedCategories(data.not_purchased_items);
      const responseNotPurchasedItems = categorizeNotPurchasedItems(
        data.not_purchased_items,
        responseIncludedCategories,
      );
      setIncludedCategories(responseIncludedCategories);
      setNotPurchasedItems(responseNotPurchasedItems); // TODO: need to sort?
      setPurchasedItems(data.purchased_items); // TODO: need to sort?
      toast('Item successfully deleted.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  return (
    <>
      <h1>{props.list.name}</h1>
      <Link to="/lists" className="float-right">
        Back to lists
      </Link>
      <br />
      {props.permissions === 'write' ? (
        <ListItemForm
          listId={props.list.id}
          listType={props.list.type}
          listUsers={props.listUsers}
          userId={props.userId}
          handleItemAddition={handleAddItem}
          categories={categories}
        />
      ) : (
        <p>You only have permission to read this list</p>
      )}
      <br />
      <div className="clearfix">
        <h2 className="float-left">Items</h2>
        <CategoryFilter
          categories={includedCategories}
          filter={filter}
          handleCategoryFilter={({ target: { name } }) => setFilter(name)}
          handleClearFilter={() => setFilter('')}
        />
      </div>
      {(filter || !includedCategories.length) && (
        <div>
          <ListItems
            category={filter}
            items={notPurchasedItems[filter]}
            permission={props.permissions}
            handleItemDelete={handleDelete}
            handlePurchaseOfItem={handleItemPurchase}
            handleReadOfItem={handleItemRead}
            handleUnReadOfItem={handleItemUnRead}
            handleItemUnPurchase={handleUnPurchase}
            listType={props.list.type}
            listUsers={props.listUsers}
          />
        </div>
      )}
      {!filter &&
        includedCategories.sort().map((category) => (
          <div key={category}>
            <ListItems
              category={category}
              items={notPurchasedItems[category]}
              permission={props.permissions}
              handleItemDelete={handleDelete}
              handlePurchaseOfItem={handleItemPurchase}
              handleReadOfItem={handleItemRead}
              handleUnReadOfItem={handleItemUnRead}
              handleItemUnPurchase={handleUnPurchase}
              listType={props.list.type}
              listUsers={props.listUsers}
            />
            <br />
          </div>
        ))}
      <br />
      <h2>{props.list.type === 'ToDoList' ? 'Completed' : 'Purchased'}</h2>
      <ListItems
        items={purchasedItems}
        purchased
        permission={props.permissions}
        handleItemDelete={handleDelete}
        handlePurchaseOfItem={handleItemPurchase}
        handleReadOfItem={handleItemRead}
        handleUnReadOfItem={handleItemUnRead}
        handleItemUnPurchase={handleUnPurchase}
        listType={props.list.type}
        listUsers={props.listUsers}
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
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
  }),
  id: PropTypes.string,
  userId: PropTypes.number,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
  }),
  purchasedItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      product: PropTypes.string,
      task: PropTypes.string,
      quantity: PropTypes.string,
      author: PropTypes.string,
      title: PropTypes.string,
      artist: PropTypes.string,
      album: PropTypes.string,
      assignee_id: PropTypes.number,
      due_by: PropTypes.string,
      read: PropTypes.bool,
      number_in_series: PropTypes.number,
      category: PropTypes.string,
    }),
  ),
  categories: PropTypes.arrayOf(PropTypes.string),
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
    }),
  ),
  includedCategories: PropTypes.arrayOf(PropTypes.string),
  notPurchasedItems: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        product: PropTypes.string,
        task: PropTypes.string,
        quantity: PropTypes.string,
        author: PropTypes.string,
        title: PropTypes.string,
        artist: PropTypes.string,
        album: PropTypes.string,
        assignee_id: PropTypes.number,
        due_by: PropTypes.string,
        read: PropTypes.bool,
        number_in_series: PropTypes.number,
        category: PropTypes.string,
      }),
    ),
  ),
  permissions: PropTypes.string,
};

export default ListContainer;
