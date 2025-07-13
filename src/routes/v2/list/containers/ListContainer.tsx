import React, { useState, type ReactNode } from 'react';
import { ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import ConfirmModal from 'components/ConfirmModal';
import {
  EUserPermissions,
  type IList,
  type IListItemConfiguration,
  type IListItemField,
  type IListUser,
  type IV2ListItem,
} from 'typings';
import { capitalize } from 'utils/format';
import { usePolling } from 'hooks';

import ListItem from '../components/ListItem';
import ListItemForm from '../components/ListItemForm';
import CategoryFilter from '../components/CategoryFilter';
import ChangeOtherListModal from '../components/ChangeOtherListModal';
import MultiSelectMenu from '../components/MultiSelectMenu';
import { fetchList } from '../utils';
import {
  handleAddItem as exportedHandleAddItem,
  handleItemSelect as exportedHandleItemSelect,
  handleItemEdit as exportedHandleItemEdit,
  handleItemComplete as exportedHandleItemComplete,
  handleItemDelete as exportedHandleItemDelete,
  handleItemRefresh as exportedHandleItemRefresh,
} from './listHandlers';

export interface IListContainerProps {
  userId: string;
  list: IList;
  categories: string[];
  completedItems: IV2ListItem[];
  listUsers: IListUser[];
  notCompletedItems: IV2ListItem[];
  permissions: EUserPermissions;
  listsToUpdate: IList[];
  listItemConfiguration: IListItemConfiguration;
  listItemConfigurations: IListItemConfiguration[];
}

const ListContainer: React.FC<IListContainerProps> = (props): React.JSX.Element => {
  const [pending, setPending] = useState(false);
  const [selectedItems, setSelectedItems] = useState([] as IV2ListItem[]);
  const [notCompletedItems, setNotCompletedItems] = useState(props.notCompletedItems);
  const [completedItems, setCompletedItems] = useState(props.completedItems);
  const [categories, setCategories] = useState(props.categories);
  const [filter, setFilter] = useState('');
  const [includedCategories, setIncludedCategories] = useState(props.categories);
  const [itemsToDelete, setItemsToDelete] = useState([] as IV2ListItem[]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [incompleteMultiSelect, setIncompleteMultiSelect] = useState(false);
  const [completeMultiSelect, setCompleteMultiSelect] = useState(false);
  const [displayedCategories, setDisplayedCategories] = useState(props.categories);
  const [copy, setCopy] = useState(false);
  const [move, setMove] = useState(false);
  const navigate = useNavigate();

  // Add polling for real-time updates
  usePolling(async () => {
    try {
      const fetchResponse = await fetchList({ id: props.list.id!, navigate });
      if (fetchResponse) {
        const {
          not_completed_items: updatedNotCompletedItems,
          completed_items: updatedCompletedItems,
          categories: updatedCategories,
        } = fetchResponse;

        const isSameSet = (newSet: IV2ListItem[], oldSet: IV2ListItem[]): boolean =>
          JSON.stringify(newSet) === JSON.stringify(oldSet);

        const notCompletedSame = isSameSet(updatedNotCompletedItems, notCompletedItems);
        const completedSame = isSameSet(updatedCompletedItems, completedItems);

        if (!notCompletedSame) {
          setNotCompletedItems(updatedNotCompletedItems);
        }
        if (!completedSame) {
          setCompletedItems(updatedCompletedItems);
        }
        if (!notCompletedSame || !completedSame) {
          setCategories(updatedCategories);
          setIncludedCategories(updatedCategories);
          if (!filter) {
            setDisplayedCategories(updatedCategories);
          }
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

  const handleFailure = (error: AxiosError, defaultMessage: string): void => {
    if (error.response) {
      if (error.response.status === 401) {
        toast('You must sign in', { type: 'error' });
        navigate('/users/sign_in');
      } else if ([403, 404].includes(error.response.status)) {
        toast(defaultMessage, { type: 'error' });
      } else {
        /* istanbul ignore next */
        toast('Something went wrong. Please try again.', { type: 'error' });
      }
    } else if (error.request) {
      /* istanbul ignore next */
      toast('Network error. Please check your connection.', { type: 'error' });
    } else {
      /* istanbul ignore next */
      toast(error.message, { type: 'error' });
    }
  };

  const handleAddItem = (newItems: IV2ListItem[]): void => {
    exportedHandleAddItem({
      newItems,
      pending,
      setPending,
      completedItems,
      setCompletedItems,
      notCompletedItems,
      setNotCompletedItems,
      categories,
      setCategories,
    });
  };

  const handleItemSelect = (item: IV2ListItem): void => {
    exportedHandleItemSelect({
      item,
      selectedItems,
      setSelectedItems,
    });
  };

  const handleItemEdit = (item: IV2ListItem): void => {
    exportedHandleItemEdit({
      item,
      listId: props.list.id!,
      navigate,
    });
  };

  const handleItemComplete = async (item: IV2ListItem): Promise<void> => {
    await exportedHandleItemComplete({
      item,
      listId: props.list.id!,
      notCompletedItems,
      setNotCompletedItems,
      completedItems,
      setCompletedItems,
      setPending,
      handleFailure,
    });
  };

  const handleItemRefresh = async (item: IV2ListItem): Promise<void> => {
    await exportedHandleItemRefresh({
      item,
      listId: props.list.id!,
      completedItems,
      setCompletedItems,
      notCompletedItems,
      setNotCompletedItems,
      setPending,
      handleFailure,
    });
  };

  // Multi-select and bulk operation handlers
  const handleDelete = (item: IV2ListItem): void => {
    const items = selectedItems.length ? selectedItems : [item];
    setItemsToDelete(items);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    setShowDeleteConfirm(false);
    const deleteRequests = itemsToDelete.map((item) =>
      exportedHandleItemDelete({
        item,
        listId: props.list.id!,
        completedItems,
        setCompletedItems,
        notCompletedItems,
        setNotCompletedItems,
        selectedItems,
        setSelectedItems,
        setPending,
        handleFailure,
      }),
    );
    try {
      await Promise.all(deleteRequests);
      setSelectedItems([]);
      setIncompleteMultiSelect(false);
      setCompleteMultiSelect(false);
      setItemsToDelete([]);
      toast(`${itemsToDelete.length > 1 ? 'Items' : 'Item'} successfully deleted.`, { type: 'info' });
    } catch (error) {
      handleFailure(error as AxiosError, 'Failed to delete items');
    }
  };

  const handleMove = (): void => {
    if (!move) {
      return;
    }
    // Remove items from not completed and add to completed
    setNotCompletedItems(
      notCompletedItems.filter((item) => !selectedItems.some((selected) => selected.id === item.id)),
    );
    setCompletedItems([...completedItems, ...selectedItems]);
    setSelectedItems([]);
    setIncompleteMultiSelect(false);
  };

  const deleteConfirmationModalBody = (): string => {
    const itemNames = itemsToDelete.map((item) => {
      const nameField = item.fields.find(
        (field) =>
          field.label === 'name' ||
          field.label === 'title' ||
          field.label === 'product' ||
          field.label === 'task' ||
          field.label === 'content',
      );
      return nameField?.data ?? 'Unknown item';
    });
    return `Are you sure you want to delete the following items? ${itemNames.join(', ')}`;
  };

  // Category filter handlers
  const handleCategoryFilter = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFilter(event.target.name);
    setDisplayedCategories([event.target.name]);
  };

  const handleClearFilter = (): void => {
    setFilter('');
    setDisplayedCategories(includedCategories);
  };

  const groupByCategory = (items: IV2ListItem[]): ReactNode => {
    // When a filter is applied, only show the selected category
    // When no filter is applied, show all categories plus uncategorized items
    const categoriesToShow = filter ? displayedCategories : [undefined, ...displayedCategories];

    return categoriesToShow.map((category: string | undefined) => {
      const itemsToRender = items.filter((item: IV2ListItem) => {
        // Defensive: treat missing fields as empty array
        const fields = Array.isArray(item.fields) ? item.fields : [];
        if (category === 'uncategorized') {
          return !fields.find((field: IListItemField) => field.label === 'category');
        }
        return category
          ? fields.find((field: IListItemField) => field.label === 'category' && field.data === category)
          : !fields.find((field: IListItemField) => field.label === 'category');
      });
      if (itemsToRender.length === 0) {
        return null;
      }
      return (
        <React.Fragment key={`${category ?? 'uncategorized'}-wrapper`}>
          {category && <h5 data-test-class="category-header">{capitalize(category)}</h5>}
          <ListGroup className="mb-3" key={category ?? 'uncategorized'}>
            {itemsToRender.map((item: IV2ListItem) => (
              <ListItem
                key={item.id}
                item={item}
                permissions={props.permissions}
                selectedItems={selectedItems}
                pending={pending}
                handleItemSelect={handleItemSelect}
                handleItemComplete={handleItemComplete}
                handleItemEdit={handleItemEdit}
                handleItemDelete={handleDelete}
                handleItemRefresh={handleItemRefresh}
                multiSelect={incompleteMultiSelect}
              />
            ))}
          </ListGroup>
        </React.Fragment>
      );
    });
  };

  return (
    <React.Fragment>
      <ChangeOtherListModal
        show={copy || move}
        setShow={copy ? setCopy : setMove}
        copy={copy}
        move={move}
        currentList={props.list}
        lists={props.listsToUpdate}
        items={selectedItems}
        setSelectedItems={setSelectedItems}
        setIncompleteMultiSelect={setIncompleteMultiSelect}
        setCompleteMultiSelect={setCompleteMultiSelect}
        handleMove={handleMove}
      />
      <Link to="/lists" className="float-end">
        Back to lists
      </Link>
      <h1>{props.list.name}</h1>
      <br />
      {props.permissions === EUserPermissions.WRITE ? (
        <ListItemForm
          listId={props.list.id!}
          listUsers={props.listUsers}
          userId={props.userId}
          handleItemAddition={handleAddItem}
          categories={props.categories}
          navigate={navigate}
          listItemConfiguration={props.listItemConfiguration}
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
            handleCategoryFilter={handleCategoryFilter}
            handleClearFilter={handleClearFilter}
          />
        </div>
      </div>
      {props.permissions === EUserPermissions.WRITE && (
        <MultiSelectMenu
          setCopy={setCopy}
          setMove={setMove}
          isMultiSelect={incompleteMultiSelect}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          setMultiSelect={setIncompleteMultiSelect}
        />
      )}
      <br />
      {groupByCategory(notCompletedItems)}

      <h2>Completed Items</h2>
      {props.permissions === EUserPermissions.WRITE && (
        <MultiSelectMenu
          setCopy={setCopy}
          setMove={setMove}
          isMultiSelect={completeMultiSelect}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
          setMultiSelect={setCompleteMultiSelect}
        />
      )}
      <ListGroup className="mb-3">
        {completedItems.map((item: IV2ListItem) => (
          <ListItem
            key={item.id}
            item={item}
            permissions={props.permissions}
            selectedItems={selectedItems}
            pending={pending}
            handleItemSelect={handleItemSelect}
            handleItemComplete={handleItemComplete}
            handleItemEdit={handleItemEdit}
            handleItemDelete={handleDelete}
            handleItemRefresh={handleItemRefresh}
            multiSelect={completeMultiSelect}
          />
        ))}
      </ListGroup>
      <ConfirmModal
        action="delete"
        body={deleteConfirmationModalBody()}
        show={showDeleteConfirm}
        handleConfirm={(): Promise<void> => handleDeleteConfirm()}
        handleClear={(): void => setShowDeleteConfirm(false)}
      />
    </React.Fragment>
  );
};

export default ListContainer;
