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
  handleToggleRead as exportedHandleToggleRead,
} from './listHandlers';
import { handleFailure } from 'utils/handleFailure';

export interface IListContainerProps {
  userId: string;
  list: IList;
  categories: string[];
  completedItems: IV2ListItem[];
  listUsers: IListUser[];
  notCompletedItems: IV2ListItem[];
  permissions: EUserPermissions;
  listsToUpdate: IList[];
  listItemConfiguration?: IListItemConfiguration;
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
          /* istanbul ignore else */
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
      includedCategories,
      setIncludedCategories,
      displayedCategories,
      setDisplayedCategories,
      filter,
      navigate,
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
    if (selectedItems.length > 1) {
      // Bulk edit - navigate with selected item IDs
      const itemIds = selectedItems.map((selectedItem) => selectedItem.id).join(',');
      navigate(`/v2/lists/${props.list.id}/list_items/bulk-edit?item_ids=${itemIds}`);
    } else {
      // Single edit
      exportedHandleItemEdit({
        item,
        listId: props.list.id!,
        navigate,
      });
    }
  };

  const handleItemComplete = async (item: IV2ListItem): Promise<void> => {
    const itemsToComplete = selectedItems.length ? selectedItems : [item];

    // Optimistic update - move items to completed immediately
    const updatedNotCompletedItems = notCompletedItems.filter(
      (item) => !itemsToComplete.some((completeItem) => completeItem.id === item.id),
    );
    const updatedCompletedItems = [...completedItems, ...itemsToComplete.map((item) => ({ ...item, completed: true }))];

    setNotCompletedItems(updatedNotCompletedItems);
    setCompletedItems(updatedCompletedItems);

    // Clear selections
    setSelectedItems([]);
    setIncompleteMultiSelect(false);
    setCompleteMultiSelect(false);

    // Make API calls in parallel for better performance
    const apiPromises = itemsToComplete.map(async (selectedItem) => {
      try {
        await exportedHandleItemComplete({
          item: selectedItem,
          listId: props.list.id!,
          setPending,
          navigate,
        });
        return { success: true, item: selectedItem };
      } catch (error) {
        return { success: false, item: selectedItem, error };
      }
    });

    const results = await Promise.all(apiPromises);

    // Check for any failures
    const failures: IV2ListItem[] = [];
    const successfulItems: IV2ListItem[] = [];
    results.forEach((result) => {
      if (result.success) {
        successfulItems.push(result.item);
      } else {
        failures.push(result.item);
      }
    });

    if (failures.length > 0) {
      // Some items failed - rollback only the failed items
      const failedItemIds = failures.map((item) => item.id);

      // Rollback failed items to original state
      const rollbackNotCompletedItems = [
        ...updatedNotCompletedItems,
        ...failures.map((item) => ({ ...item!, completed: false })),
      ];
      const rollbackCompletedItems = updatedCompletedItems.filter((item) => !failedItemIds.includes(item.id));

      setNotCompletedItems(rollbackNotCompletedItems);
      setCompletedItems(rollbackCompletedItems);

      // Show appropriate feedback
      if (successfulItems.length > 0) {
        const pluralize = (items: IV2ListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
        toast(
          `Some items failed to complete. ${pluralize(successfulItems)} completed successfully. ${pluralize(
            failures,
          )} failed.`,
          { type: 'warning' },
        );
      } else {
        // All items failed
        handleFailure({
          error: new Error('All items failed to complete') as AxiosError,
          notFoundMessage: 'Failed to complete items',
        });
      }
    } else {
      // All items succeeded
      const pluralize = (items: IV2ListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
      toast(`${pluralize(itemsToComplete)} marked as completed.`, { type: 'info' });
    }
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
      navigate,
    });
  };

  const toggleRead = async (item: IV2ListItem): Promise<void> => {
    const items = selectedItems.length ? selectedItems : [item];
    await exportedHandleToggleRead({
      items,
      listId: props.list.id!,
      completedItems,
      setCompletedItems,
      notCompletedItems,
      setNotCompletedItems,
      setSelectedItems,
      setIncompleteMultiSelect,
      setCompleteMultiSelect,
      navigate,
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

    const itemsToDeleteFromState = itemsToDelete;

    // Optimistic update - remove items immediately
    const updatedCompletedItems = completedItems.filter(
      (item) => !itemsToDeleteFromState.some((deleteItem) => deleteItem.id === item.id),
    );
    const updatedNotCompletedItems = notCompletedItems.filter(
      (item) => !itemsToDeleteFromState.some((deleteItem) => deleteItem.id === item.id),
    );

    setCompletedItems(updatedCompletedItems);
    setNotCompletedItems(updatedNotCompletedItems);

    // Clear selections
    setSelectedItems([]);
    setIncompleteMultiSelect(false);
    setCompleteMultiSelect(false);
    setItemsToDelete([]);

    // Make API calls in parallel for better performance
    const apiPromises = itemsToDeleteFromState.map((item) =>
      exportedHandleItemDelete({
        item,
        listId: props.list.id!,
        completedItems: updatedCompletedItems,
        setCompletedItems,
        notCompletedItems: updatedNotCompletedItems,
        setNotCompletedItems,
        selectedItems: [],
        setSelectedItems,
        setPending,
        navigate,
        showToast: false,
      }),
    );

    const results = await Promise.allSettled(apiPromises);

    // Check for any failures
    const failures: IV2ListItem[] = [];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        failures.push(itemsToDeleteFromState[index]);
      }
    });

    if (failures.length > 0) {
      // Some items failed - rollback only the failed items
      const failedItemIds = failures.map((item) => item.id);
      const successfulItems = itemsToDeleteFromState.filter((item) => !failedItemIds.includes(item.id));

      // Rollback failed items to original state
      const rollbackCompletedItems = [
        ...updatedCompletedItems,
        ...failures.filter((item) => completedItems.some((orig) => orig.id === item.id)),
      ];
      const rollbackNotCompletedItems = [
        ...updatedNotCompletedItems,
        ...failures.filter((item) => notCompletedItems.some((orig) => orig.id === item.id)),
      ];

      setCompletedItems(rollbackCompletedItems);
      setNotCompletedItems(rollbackNotCompletedItems);

      // Show appropriate feedback
      if (successfulItems.length > 0) {
        const pluralize = (items: IV2ListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
        toast(
          `Some items failed to delete. ${pluralize(successfulItems)} deleted successfully. ${pluralize(
            failures,
          )} failed.`,
          { type: 'warning' },
        );
      } else {
        // All items failed
        toast('Failed to delete items. Please try again.', { type: 'error' });
      }
    } else {
      // All items succeeded
      const pluralize = (items: IV2ListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
      toast(`${pluralize(itemsToDeleteFromState)} successfully deleted.`, { type: 'info' });
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
    setMove(false);
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
    // When a filter is applied, show the selected category plus uncategorized items
    // When no filter is applied, show all categories plus uncategorized items
    const categoriesToShow = filter ? [undefined, ...displayedCategories] : [undefined, ...displayedCategories];

    return categoriesToShow.map((category: string | undefined) => {
      const itemsToRender = items.filter((item: IV2ListItem) => {
        // Defensive: treat missing fields as empty array
        const fields = Array.isArray(item.fields) ? item.fields : [];
        return category
          ? fields.find((field: IListItemField) => field.label === 'category' && field.data === category)
          : !fields.find((field: IListItemField) => field.label === 'category') ||
              fields.find((field: IListItemField) => field.label === 'category' && (!field.data || field.data === ''));
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
                listType={props.list.type}
                handleItemSelect={handleItemSelect}
                handleItemComplete={handleItemComplete}
                handleItemEdit={handleItemEdit}
                handleItemDelete={handleDelete}
                handleItemRefresh={handleItemRefresh}
                toggleItemRead={toggleRead}
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
            listType={props.list.type}
            handleItemSelect={handleItemSelect}
            handleItemComplete={handleItemComplete}
            handleItemEdit={handleItemEdit}
            handleItemDelete={handleDelete}
            handleItemRefresh={handleItemRefresh}
            toggleItemRead={toggleRead}
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
