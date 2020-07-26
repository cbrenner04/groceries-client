import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button } from 'react-bootstrap';

import { listTypeToSnakeCase } from '../../../utils/format';
import ListItemForm from '../components/ListItemForm';
import ConfirmModal from '../../../components/ConfirmModal';
import axios from '../../../utils/api';
import { itemName, sortItems } from '../utils';
import ListItems from '../components/ListItems';
import CategoryFilter from '../components/CategoryFilter';
import Loading from '../../../components/Loading';

function ListContainer(props) {
  const [notPurchasedItems, setNotPurchasedItems] = useState(props.notPurchasedItems);
  const [purchasedItems, setPurchasedItems] = useState(props.purchasedItems);
  const [categories, setCategories] = useState(props.categories);
  const [filter, setFilter] = useState('');
  const [includedCategories, setIncludedCategories] = useState(props.includedCategories);
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pending, setPending] = useState(false);

  const handleAddItem = (data) => {
    // this is to deal the ListItemForm being passed this function
    const items = Array.isArray(data) ? data : [data];
    let updatedNotPurchasedItems = notPurchasedItems;
    const itemCategories = [];
    items.forEach((item) => {
      const category = item.category || '';
      itemCategories.push(category);
      if (!updatedNotPurchasedItems[category]) {
        updatedNotPurchasedItems = update(updatedNotPurchasedItems, { [category]: { $set: [item] } });
      } else {
        updatedNotPurchasedItems = update(updatedNotPurchasedItems, { [category]: { $push: [item] } });
        updatedNotPurchasedItems[category] = sortItems(props.list.type, updatedNotPurchasedItems[category]);
      }
    });
    setNotPurchasedItems(updatedNotPurchasedItems);
    let cats = categories;
    let includedCats = includedCategories;
    itemCategories.forEach((category) => {
      if (!cats.includes(category)) {
        cats = update(cats, { $push: [category] });
      }
      if (!includedCats.includes(category)) {
        includedCats = update(includedCats, { $push: [category] });
      }
    });
    setCategories(cats);
    setIncludedCategories(includedCats);
  };

  const listId = (item) => item[`${listTypeToSnakeCase(props.list.type)}_id`];
  const listItemPath = (item) => `/lists/${listId(item)}/${listTypeToSnakeCase(props.list.type)}_items`;

  const removeItemsFromNotPurchased = (items) => {
    let updatedNotPurchasedItems = notPurchasedItems;
    const itemCategories = [];
    items.forEach((item) => {
      const category = item.category || '';
      itemCategories.push(category);
      const itemIndex = updatedNotPurchasedItems[category].findIndex((npItem) => npItem.id === item.id);
      updatedNotPurchasedItems = update(updatedNotPurchasedItems, { [category]: { $splice: [[itemIndex, 1]] } });
    });
    setNotPurchasedItems(updatedNotPurchasedItems);
    let updateIncludedCats = includedCategories;
    itemCategories.forEach((category) => {
      if (category && !updatedNotPurchasedItems[category].length) {
        const catIndex = updateIncludedCats.findIndex((inCat) => inCat === category);
        updateIncludedCats = update(updateIncludedCats, { $splice: [[catIndex, 1]] });
        if (filter === category) {
          setFilter('');
        }
      }
    });
    setIncludedCategories(updateIncludedCats);
  };

  const moveItemsToPurchased = (items) => {
    removeItemsFromNotPurchased(items);
    const updatedItems = items.map((item) => {
      if (props.list.type === 'ToDoList') {
        item.completed = true;
      } else {
        item.purchased = true;
      }
      return item;
    });
    const updatedPurchasedItems = update(purchasedItems, { $push: updatedItems });
    setPurchasedItems(sortItems(props.list.type, updatedPurchasedItems));
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

  const resetMultiSelect = () => {
    setSelectedItems([]);
    setMultiSelect(false);
  };

  const pluralize = (items) => {
    return items.length > 1 ? 'Items' : 'Item';
  };

  const handleItemPurchase = async (item) => {
    const items = selectedItems.length ? selectedItems : [item];
    const filteredItems = items.filter((item) => !item.purchased && !item.completed);
    const completionType = props.list.type === 'ToDoList' ? 'completed' : 'purchased';
    const updateRequests = filteredItems.map((item) =>
      axios.put(`${listItemPath(item)}/${item.id}`, {
        [`${listTypeToSnakeCase(props.list.type)}_item`]: {
          [completionType]: true,
        },
      }),
    );
    try {
      await Promise.all(updateRequests);
      moveItemsToPurchased(filteredItems);
      resetMultiSelect();
      toast(`${pluralize(filteredItems)} successfully purchased.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const toggleRead = async (item) => {
    const items = selectedItems.length ? selectedItems : [item];
    const updateRequests = items.map((item) => {
      const isRead = !item.read;
      return axios.put(`${listItemPath(item)}/${item.id}`, {
        [`${listTypeToSnakeCase(props.list.type)}_item`]: {
          read: isRead,
        },
      });
    });
    try {
      await Promise.all(updateRequests);
      let newPurchasedItems = purchasedItems;
      let newNotPurchasedItems = notPurchasedItems;
      items.forEach((item) => {
        item.read = !item.read;
        if (item.purchased) {
          const itemIndex = newPurchasedItems.findIndex((purchasedItem) => item.id === purchasedItem.id);
          const newItems = [...newPurchasedItems];
          newItems[itemIndex] = item;
          newPurchasedItems = update(newPurchasedItems, { $set: newItems });
        } else {
          const itemsInCat = newNotPurchasedItems[item.category];
          if (itemsInCat) {
            const itemIndex = itemsInCat.findIndex((notPurchasedItem) => item.id === notPurchasedItem.id);
            const newItemsInCat = [...itemsInCat];
            newItemsInCat[itemIndex] = item;
            newNotPurchasedItems = update(newNotPurchasedItems, { [item.category]: { $set: newItemsInCat } });
          }
        }
      });
      setPurchasedItems(newPurchasedItems);
      setNotPurchasedItems(newNotPurchasedItems);
      resetMultiSelect();
      toast(`${pluralize(items)} successfully updated.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const removeItemsFromPurchased = (items) => {
    let updatePurchasedItems = purchasedItems;
    items.forEach((item) => {
      const itemIndex = updatePurchasedItems.findIndex((purchasedItem) => purchasedItem.id === item.id);
      updatePurchasedItems = sortItems(props.list.type, update(updatePurchasedItems, { $splice: [[itemIndex, 1]] }));
    });
    setPurchasedItems(updatePurchasedItems);
  };

  // TODO: rename! this is an awful name. `handleRefresh` or `handleItemRefresh`
  const handleUnPurchase = async (item) => {
    setPending(true);
    const items = selectedItems.length ? selectedItems : [item];
    const filteredItems = items.filter((item) => item.purchased || item.completed);
    const createNewItemRequests = [];
    const updateOldItemRequests = [];
    filteredItems.forEach((item) => {
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
      createNewItemRequests.push(axios.post(`${listItemPath(newItem)}`, postData));
      updateOldItemRequests.push(
        axios.put(`${listItemPath(item)}/${item.id}`, {
          [`${listTypeToSnakeCase(props.list.type)}_item`]: {
            refreshed: true,
          },
        }),
      );
    });
    try {
      const newItemResponses = await Promise.all(createNewItemRequests);
      await Promise.all(updateOldItemRequests);
      const newItems = newItemResponses.map(({ data }) => data);
      handleAddItem(newItems);
      removeItemsFromPurchased(filteredItems);
      resetMultiSelect();
      setPending(false);
      toast(`${pluralize(filteredItems)} successfully refreshed.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleDelete = (item) => {
    const items = selectedItems.length ? selectedItems : [item];
    setItemsToDelete(items);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const deleteRequests = itemsToDelete.map((item) => axios.delete(`${listItemPath(item)}/${item.id}`));
      await Promise.all(deleteRequests);
      setShowDeleteConfirm(false);
      const notPurchasedDeletedItems = [];
      const purchasedDeletedItems = [];
      itemsToDelete.forEach((item) => {
        if (item.completed || item.purchased) {
          purchasedDeletedItems.push(item);
        } else {
          notPurchasedDeletedItems.push(item);
        }
      });
      removeItemsFromPurchased(purchasedDeletedItems);
      removeItemsFromNotPurchased(notPurchasedDeletedItems);
      resetMultiSelect();
      setItemsToDelete([]);
      toast(`${pluralize(itemsToDelete)} successfully deleted.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleItemSelect = (item) => {
    const itemIds = selectedItems.map((i) => i.id).join(',');
    let updatedItems;
    if (itemIds.includes(item.id)) {
      updatedItems = selectedItems.filter((i) => i.id !== item.id);
    } else {
      updatedItems = update(selectedItems, { $push: [item] });
    }
    setSelectedItems(updatedItems);
  };

  const handleItemEdit = async (item) => {
    const path = listItemPath(item);
    if (selectedItems.length) {
      const itemIds = selectedItems.map((item) => item.id).join(',');
      props.history.push(`${path}/bulk-edit?item_ids=${itemIds}`);
    } else {
      props.history.push(`${path}/${item.id}/edit`);
    }
  };

  return (
    <>
      {pending && <Loading />}
      {!pending && (
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
              history={props.history}
            />
          ) : (
            <p>You only have permission to read this list</p>
          )}
          <hr />
          <div className="d-flex justify-content-between">
            <h2>Items</h2>
            <div>
              <CategoryFilter
                categories={includedCategories}
                filter={filter}
                handleCategoryFilter={({ target: { name } }) => setFilter(name)}
                handleClearFilter={() => setFilter('')}
              />
            </div>
          </div>
          {props.permissions === 'write' && (
            <div className="clearfix">
              <Button
                variant="link"
                className="mx-auto float-right"
                onClick={() => {
                  if (multiSelect && selectedItems.length > 0) {
                    setSelectedItems([]);
                  }
                  setMultiSelect(!multiSelect);
                }}
              >
                {multiSelect ? 'Hide' : ''} Select
              </Button>
            </div>
          )}
          {(filter || !includedCategories.length) && (
            <div>
              <ListItems
                category={filter}
                items={notPurchasedItems[filter]}
                permission={props.permissions}
                handleItemDelete={handleDelete}
                handlePurchaseOfItem={handleItemPurchase}
                toggleItemRead={toggleRead}
                handleItemUnPurchase={handleUnPurchase}
                listType={props.list.type}
                listUsers={props.listUsers}
                multiSelect={multiSelect}
                handleItemEdit={handleItemEdit}
                handleItemSelect={handleItemSelect}
                selectedItems={selectedItems}
              />
            </div>
          )}
          {!filter &&
            includedCategories.sort().map(
              (category) =>
                (category || (notPurchasedItems[category] && notPurchasedItems[category].length > 0)) && (
                  <div key={category}>
                    <ListItems
                      category={category}
                      items={notPurchasedItems[category]}
                      permission={props.permissions}
                      handleItemDelete={handleDelete}
                      handlePurchaseOfItem={handleItemPurchase}
                      toggleItemRead={toggleRead}
                      handleItemUnPurchase={handleUnPurchase}
                      listType={props.list.type}
                      listUsers={props.listUsers}
                      multiSelect={multiSelect}
                      handleItemSelect={handleItemSelect}
                      handleItemEdit={handleItemEdit}
                      selectedItems={selectedItems}
                    />
                    <br />
                  </div>
                ),
            )}
          <br />
          <h2>{props.list.type === 'ToDoList' ? 'Completed' : 'Purchased'}</h2>
          <ListItems
            items={purchasedItems}
            purchased
            permission={props.permissions}
            handleItemDelete={handleDelete}
            handlePurchaseOfItem={handleItemPurchase}
            handleItemUnPurchase={handleUnPurchase}
            toggleItemRead={toggleRead}
            listType={props.list.type}
            listUsers={props.listUsers}
            multiSelect={multiSelect}
            handleItemSelect={handleItemSelect}
            handleItemEdit={handleItemEdit}
            selectedItems={selectedItems}
          />
          <ConfirmModal
            action="delete"
            body={`Are you sure you want to delete the following items? ${itemsToDelete
              .map((item) => itemName(item, props.list.type))
              .join(', ')}`}
            show={showDeleteConfirm}
            handleConfirm={() => handleDeleteConfirm()}
            handleClear={() => setShowDeleteConfirm(false)}
          />
        </>
      )}
    </>
  );
}

ListContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  userId: PropTypes.number.isRequired,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    owner_id: PropTypes.number.isRequired,
  }).isRequired,
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
      completed: PropTypes.bool,
      purchased: PropTypes.bool,
    }),
  ).isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  includedCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
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
        completed: PropTypes.bool,
        purchased: PropTypes.bool,
      }),
    ),
  ).isRequired,
  permissions: PropTypes.string.isRequired,
};

export default ListContainer;
