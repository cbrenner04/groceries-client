import React, { type ChangeEvent, type MouseEventHandler, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import update from 'immutability-helper';
import { toast } from 'react-toastify';
import { Button, ListGroup } from 'react-bootstrap';
import { type AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

import ConfirmModal from 'components/ConfirmModal';
import axios from 'utils/api';
import { capitalize } from 'utils/format';
import { usePolling } from 'hooks';
import type { IList, IListItem, IListUser } from 'typings';

import ListItem from '../components/ListItem';
import ListItemForm from '../components/ListItemForm';
import CategoryFilter from '../components/CategoryFilter';
import { fetchList, itemName, sortItems } from '../utils';

export interface IListContainerProps {
  userId: string;
  list: IList;
  purchasedItems: IListItem[];
  categories: string[];
  listUsers: IListUser[];
  includedCategories: string[];
  notPurchasedItems: Record<string, IListItem[]>;
  permissions: string;
}

const ListContainer: React.FC<IListContainerProps> = (props): React.JSX.Element => {
  const [notPurchasedItems, setNotPurchasedItems] = useState(props.notPurchasedItems);
  const [purchasedItems, setPurchasedItems] = useState(props.purchasedItems);
  const [categories, setCategories] = useState(props.categories);
  const [filter, setFilter] = useState('');
  const [includedCategories, setIncludedCategories] = useState(props.includedCategories);
  const [itemsToDelete, setItemsToDelete] = useState([] as IListItem[]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [incompleteMultiSelect, setIncompleteMultiSelect] = useState(false);
  const [completeMultiSelect, setCompleteMultiSelect] = useState(false);
  const [selectedItems, setSelectedItems] = useState([] as IListItem[]);
  const [pending, setPending] = useState(false);
  const [displayedCategories, setDisplayedCategories] = useState(props.includedCategories);
  const [listUsers, setListUsers] = useState(props.listUsers);
  const navigate = useNavigate();

  usePolling(async () => {
    try {
      const fetchResponse = await fetchList({ id: props.list.id, navigate });
      /* istanbul ignore else */
      if (fetchResponse) {
        const {
          purchasedItems: updatedPurchasedItems,
          categories: updatedCategories,
          listUsers: updatedListUsers,
          includedCategories: updatedIncludedCategories,
          notPurchasedItems: updatedNotPurchasedItems,
        } = fetchResponse;
        const isSameSet = (
          newSet: IListItem[] | Record<string, IListItem[]>,
          oldSet: IListItem[] | Record<string, IListItem[]>,
        ): boolean => JSON.stringify(newSet) === JSON.stringify(oldSet);
        const purchasedItemsSame = isSameSet(updatedPurchasedItems, purchasedItems);
        const notPurchasedItemsSame = isSameSet(updatedNotPurchasedItems, notPurchasedItems);
        if (!purchasedItemsSame) {
          setPurchasedItems(updatedPurchasedItems);
        }
        if (!notPurchasedItemsSame) {
          setNotPurchasedItems(updatedNotPurchasedItems);
        }
        if (!purchasedItemsSame || !notPurchasedItemsSame) {
          setCategories(updatedCategories);
          setIncludedCategories(updatedIncludedCategories);
          /* istanbul ignore else */
          if (!filter) {
            setDisplayedCategories(updatedIncludedCategories);
          }
          setListUsers(updatedListUsers);
        }
      }
    } catch (_err) {
      const errorMessage = 'You may not be connected to the internet. Please check your connection.';
      toast(`${errorMessage} Data may be incomplete and user actions may not persist.`, {
        type: 'error',
        autoClose: 5000,
      });
    }
  }, 3000);

  const handleAddItem = (data: IListItem[]): void => {
    // this is to deal the ListItemForm being passed this function
    const items = Array.isArray(data) ? data : [data];
    let updatedNotPurchasedItems = notPurchasedItems;
    const itemCategories: string[] = [];
    items.forEach((item) => {
      /* istanbul ignore next */
      const category = item.category ?? '';
      itemCategories.push(category);
      // TODO: why????
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
    if (!filter) {
      setDisplayedCategories(includedCats);
    }
  };

  const listItemPath = (): string => `/lists/${props.list.id}/list_items`;

  const removeItemsFromNotPurchased = (items: IListItem[]): void => {
    let updatedNotPurchasedItems = notPurchasedItems;
    const itemCategories: string[] = [];
    items.forEach((item) => {
      /* istanbul ignore next */
      const category = item.category ?? '';
      itemCategories.push(category);
      const itemIndex = updatedNotPurchasedItems[category].findIndex((npItem) => npItem.id === item.id);
      updatedNotPurchasedItems = update(updatedNotPurchasedItems, { [category]: { $splice: [[itemIndex, 1]] } });
    });
    setNotPurchasedItems(updatedNotPurchasedItems);
    let updateIncludedCats = includedCategories;
    let updateDisplayedCategories = false;
    itemCategories.forEach((category) => {
      if (category && !updatedNotPurchasedItems[category].length) {
        updateDisplayedCategories = true;
        const catIndex = updateIncludedCats.findIndex((inCat) => inCat === category);
        updateIncludedCats = update(updateIncludedCats, { $splice: [[catIndex, 1]] });
        if (filter === category) {
          setFilter('');
        }
      }
    });
    setIncludedCategories(updateIncludedCats);
    // TODO: why???? this is so stupid. it is definitely not always falsy
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (updateDisplayedCategories) {
      setDisplayedCategories(updateIncludedCats);
    }
  };

  const moveItemsToPurchased = (items: IListItem[]): void => {
    removeItemsFromNotPurchased(items);
    const updatedItems = items.map((item) => {
      if (['ToDoList', 'SimpleList'].includes(props.list.type)) {
        item.completed = true;
      } else {
        item.purchased = true;
      }
      return item;
    });
    const updatedPurchasedItems = update(purchasedItems, { $push: updatedItems });
    setPurchasedItems(sortItems(props.list.type, updatedPurchasedItems));
  };

  const failure = (err: unknown): void => {
    const error = err as AxiosError;
    if (error.response) {
      if (error.response.status === 401) {
        toast('You must sign in', { type: 'error' });
        navigate('/users/sign_in');
      } else if ([403, 404].includes(error.response.status)) {
        toast('Item not found', { type: 'error' });
      } else {
        const responseTextKeys = Object.keys(error.response.data!);
        const responseErrors = responseTextKeys.map(
          (key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
        );
        toast(responseErrors.join(' and '), { type: 'error' });
      }
    } else if (error.request) {
      toast('Something went wrong', { type: 'error' });
    } else {
      toast(error.message, { type: 'error' });
    }
  };

  const pluralize = (items: IListItem[]): string => {
    return items.length > 1 ? 'Items' : 'Item';
  };

  const handleItemPurchase = async (item: IListItem): Promise<void> => {
    const items = selectedItems.length ? selectedItems : [item];
    const filteredItems = items.filter((i) => !i.purchased && !i.completed);
    const completionType = ['ToDoList', 'SimpleList'].includes(props.list.type) ? 'completed' : 'purchased';
    const updateRequests = filteredItems.map((i) =>
      axios.put(`${listItemPath()}/${i.id}`, {
        list_item: {
          [completionType]: true,
        },
      }),
    );
    try {
      await Promise.all(updateRequests);
      moveItemsToPurchased(filteredItems);
      setSelectedItems([]);
      setIncompleteMultiSelect(false);
      toast(`${pluralize(filteredItems)} successfully purchased.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const toggleRead = async (item: IListItem): Promise<void> => {
    const items = selectedItems.length ? selectedItems : [item];
    const updateRequests = items.map((item) => {
      const isRead = !item.read;
      return axios.put(`${listItemPath()}/${item.id}`, {
        list_item: {
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
          const cat = item.category ?? /* istanbul ignore next */ '';
          const itemsInCat = newNotPurchasedItems[cat];
          const itemIndex = itemsInCat.findIndex((notPurchasedItem) => item.id === notPurchasedItem.id);
          const newItemsInCat = [...itemsInCat];
          newItemsInCat[itemIndex] = item;
          newNotPurchasedItems = update(newNotPurchasedItems, { [cat]: { $set: newItemsInCat } });
        }
      });
      setPurchasedItems(newPurchasedItems);
      setNotPurchasedItems(newNotPurchasedItems);
      setSelectedItems([]);
      setIncompleteMultiSelect(false);
      setCompleteMultiSelect(false);
      toast(`${pluralize(items)} successfully updated.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const removeItemsFromPurchased = (items: IListItem[]): void => {
    let updatePurchasedItems = purchasedItems;
    items.forEach((item) => {
      const itemIndex = updatePurchasedItems.findIndex((purchasedItem) => purchasedItem.id === item.id);
      updatePurchasedItems = sortItems(props.list.type, update(updatePurchasedItems, { $splice: [[itemIndex, 1]] }));
    });
    setPurchasedItems(updatePurchasedItems);
  };

  const handleRefresh = async (item: IListItem): Promise<void> => {
    setPending(true);
    const items = selectedItems.length ? selectedItems : [item];
    const filteredItems = items.filter((item) => item.purchased ?? /* istanbul ignore next */ item.completed);
    const createNewItemRequests: Promise<AxiosResponse>[] = [];
    const updateOldItemRequests: Promise<AxiosResponse>[] = [];
    filteredItems.forEach((item) => {
      const newItem = {
        user_id: item.user_id,
        product: item.product,
        task: item.task,
        content: item.content,
        quantity: item.quantity,
        purchased: false,
        completed: false,
        assignee_id: item.assignee_id,
        due_by: item.due_by,
        category: item.category,
      };
      const postData: Record<'list_item', typeof newItem> = { list_item: newItem };
      createNewItemRequests.push(axios.post(listItemPath(), postData));
      updateOldItemRequests.push(
        axios.put(`${listItemPath()}/${item.id}`, {
          list_item: {
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
      setSelectedItems([]);
      setCompleteMultiSelect(false);
      setPending(false);
      toast(`${pluralize(filteredItems)} successfully refreshed.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleDelete = (item: IListItem): void => {
    const items = selectedItems.length ? selectedItems : [item];
    setItemsToDelete(items);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    setShowDeleteConfirm(false);
    const deleteRequests = itemsToDelete.map((item) => axios.delete(`${listItemPath()}/${item.id}`));
    try {
      await Promise.all(deleteRequests);
      const notPurchasedDeletedItems: IListItem[] = [];
      const purchasedDeletedItems: IListItem[] = [];
      itemsToDelete.forEach((item) => {
        if (item.completed || item.purchased) {
          purchasedDeletedItems.push(item);
        } else {
          notPurchasedDeletedItems.push(item);
        }
      });
      removeItemsFromPurchased(purchasedDeletedItems);
      removeItemsFromNotPurchased(notPurchasedDeletedItems);
      setSelectedItems([]);
      setIncompleteMultiSelect(false);
      setCompleteMultiSelect(false);
      setItemsToDelete([]);
      toast(`${pluralize(itemsToDelete)} successfully deleted.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleItemSelect = (item: IListItem): void => {
    const itemIds = selectedItems.map((i) => i.id);
    let updatedItems;
    if (itemIds.includes(item.id)) {
      updatedItems = selectedItems.filter((i) => i.id !== item.id);
    } else {
      updatedItems = update(selectedItems, { $push: [item] });
    }
    setSelectedItems(updatedItems);
  };

  const handleItemEdit = async (item: IListItem): Promise<void> => {
    if (selectedItems.length) {
      const itemIds = selectedItems.map((item) => item.id).join(',');
      navigate(`${listItemPath()}/bulk-edit?item_ids=${itemIds}`);
    } else {
      navigate(`${listItemPath()}/${item.id}/edit`);
    }
  };

  return (
    <React.Fragment>
      <Link to="/lists" className="float-end">
        Back to lists
      </Link>
      <h1>{props.list.name}</h1>
      <br />
      {props.permissions === 'write' ? (
        <ListItemForm
          listId={props.list.id}
          listType={props.list.type}
          listUsers={listUsers}
          userId={props.userId}
          handleItemAddition={handleAddItem}
          categories={categories}
          navigate={navigate}
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
            // TODO: figure out typing
            handleCategoryFilter={
              (({ target: { name } }: ChangeEvent<HTMLInputElement>) => {
                setFilter(name);
                setDisplayedCategories([name]);
              }) as unknown as MouseEventHandler
            }
            handleClearFilter={(): void => {
              setFilter('');
              setDisplayedCategories(includedCategories);
            }}
          />
        </div>
      </div>
      {props.permissions === 'write' && (
        <div className="clearfix">
          <Button
            variant="link"
            className="mx-auto float-end"
            onClick={(): void => {
              if (incompleteMultiSelect && selectedItems.length > 0) {
                setSelectedItems([]);
              }
              setIncompleteMultiSelect(!incompleteMultiSelect);
            }}
          >
            {incompleteMultiSelect ? 'Hide' : ''} Select
          </Button>
        </div>
      )}
      {displayedCategories.sort().map((category) => (
        <ListGroup className="mb-3" key={category}>
          {category && <h5 data-test-class="category-header">{capitalize(category)}</h5>}
          {// TODO: again, why?
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          notPurchasedItems[category]?.map((item) => (
            <ListItem
              item={item}
              key={item.id}
              purchased={false}
              handleItemDelete={handleDelete}
              handlePurchaseOfItem={handleItemPurchase}
              handleItemRefresh={handleRefresh}
              listType={props.list.type}
              listUsers={props.listUsers}
              permission={props.permissions}
              multiSelect={incompleteMultiSelect}
              handleItemSelect={handleItemSelect}
              toggleItemRead={toggleRead}
              handleItemEdit={handleItemEdit}
              selectedItems={selectedItems}
              pending={pending}
            />
          ))}
        </ListGroup>
      ))}
      <br />
      <h2>{['ToDoList', 'SimpleList'].includes(props.list.type) ? 'Completed' : 'Purchased'}</h2>
      {props.permissions === 'write' && (
        <div className="clearfix">
          <Button
            variant="link"
            className="mx-auto float-end"
            onClick={(): void => {
              if (completeMultiSelect && selectedItems.length > 0) {
                setSelectedItems([]);
              }
              setCompleteMultiSelect(!completeMultiSelect);
            }}
          >
            {completeMultiSelect ? 'Hide' : ''} Select
          </Button>
        </div>
      )}
      <ListGroup className="mb-3">
        {purchasedItems.map((item) => (
          <ListItem
            item={item}
            key={item.id}
            purchased={true}
            handleItemDelete={handleDelete}
            handlePurchaseOfItem={handleItemPurchase}
            handleItemRefresh={handleRefresh}
            listType={props.list.type}
            listUsers={props.listUsers}
            permission={props.permissions}
            multiSelect={completeMultiSelect}
            handleItemSelect={handleItemSelect}
            toggleItemRead={toggleRead}
            handleItemEdit={handleItemEdit}
            selectedItems={selectedItems}
            pending={pending}
          />
        ))}
      </ListGroup>
      <ConfirmModal
        action="delete"
        body={`Are you sure you want to delete the following items? ${itemsToDelete
          .map((item) => itemName(item, props.list.type))
          .join(', ')}`}
        show={showDeleteConfirm}
        handleConfirm={(): Promise<void> => handleDeleteConfirm()}
        handleClear={(): void => setShowDeleteConfirm(false)}
      />
    </React.Fragment>
  );
};

export default ListContainer;
