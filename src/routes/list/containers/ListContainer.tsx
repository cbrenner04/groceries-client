import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import ConfirmModal from 'components/ConfirmModal';
import { EUserPermissions, type IList, type IListItemConfiguration, type IListUser, type IListItem } from 'typings';
import { usePolling } from 'hooks';
import { useMobileSafariOptimizations } from 'hooks/useMobileSafariOptimizations';

import ListItemForm from '../components/ListItemForm';
import CategoryFilter from '../components/CategoryFilter';
import ChangeOtherListModal from '../components/ChangeOtherListModal';
import NotCompletedItemsSection from '../components/NotCompletedItemsSection';
import CompletedItemsSection from '../components/CompletedItemsSection';
import { fetchList } from '../utils';
import {
  handleAddItem as exportedHandleAddItem,
  handleItemSelect as exportedHandleItemSelect,
  handleItemEdit as exportedHandleItemEdit,
  handleItemComplete as exportedHandleItemComplete,
  handleItemDelete as exportedHandleItemDelete,
  handleItemRefresh as exportedHandleItemRefresh,
  sortItemsByCreatedAt,
  executeBulkOperations,
  pluralize,
  extractCategoriesFromItems,
} from './listHandlers';
import type { IFulfilledListData } from '../utils';
import { listDeduplicator } from 'utils/requestDeduplication';
import { listCache } from 'utils/lightweightCache';

export interface IListContainerProps {
  userId: string;
  list: IList;
  categories: string[];
  completedItems: IListItem[];
  listUsers: IListUser[];
  notCompletedItems: IListItem[];
  permissions: EUserPermissions;
  listsToUpdate: IList[];
  listItemConfiguration?: IListItemConfiguration;
  listItemFieldConfigurations?: { id: string; label: string; data_type: string; position: number; primary: boolean }[];
}

const ListContainer: React.FC<IListContainerProps> = (props): React.JSX.Element => {
  const [pending, setPending] = useState(false);
  const [selectedItems, setSelectedItems] = useState([] as IListItem[]);
  const [notCompletedItems, setNotCompletedItems] = useState(props.notCompletedItems);
  const [completedItems, setCompletedItems] = useState(props.completedItems);
  const [categories, setCategories] = useState(props.categories);
  const [filter, setFilter] = useState('');

  // Mobile Safari optimizations
  const { isVisible, isLowMemory, cleanup: registerCleanup } = useMobileSafariOptimizations();
  const [includedCategories, setIncludedCategories] = useState(props.categories);
  const [itemsToDelete, setItemsToDelete] = useState([] as IListItem[]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [incompleteMultiSelect, setIncompleteMultiSelect] = useState(false);
  const [completeMultiSelect, setCompleteMultiSelect] = useState(false);
  const [displayedCategories, setDisplayedCategories] = useState(props.categories);
  const [copy, setCopy] = useState(false);
  const [move, setMove] = useState(false);
  const navigate = useNavigate();

  // Note: Field configurations are now preloaded with list data, eliminating the need for mount prefetch

  // Note: Idle prefetch is also eliminated since field configurations are preloaded with list data

  // Add polling for real-time updates with request deduplication
  usePolling(
    async () => {
      // Skip polling if tab is not visible or low memory (Mobile Safari optimization)
      if (!isVisible || isLowMemory) {
        return;
      }

      try {
        const fetchResponse = await listDeduplicator.execute(`list-${props.list.id}`, () =>
          fetchList({ id: props.list.id!, navigate, signal: new AbortController().signal }),
        );

        if (fetchResponse) {
          const {
            not_completed_items: updatedNotCompletedItems,
            completed_items: updatedCompletedItems,
            categories: updatedCategories,
          } = fetchResponse as IFulfilledListData;

          // Use lightweight cache to avoid re-render churn for identical data
          const notCompletedCacheKey = `list-${props.list.id}-not-completed`;
          const completedCacheKey = `list-${props.list.id}-completed`;
          const categoriesCacheKey = `list-${props.list.id}-categories`;

          const notCompletedResult = listCache.get(notCompletedCacheKey, updatedNotCompletedItems);
          const completedResult = listCache.get(completedCacheKey, updatedCompletedItems);
          const categoriesResult = listCache.get(categoriesCacheKey, updatedCategories);

          // Only update state if data has actually changed
          if (notCompletedResult.hasChanged) {
            setNotCompletedItems(updatedNotCompletedItems);
          }
          if (completedResult.hasChanged) {
            setCompletedItems(updatedCompletedItems);
          }
          if (notCompletedResult.hasChanged || completedResult.hasChanged || categoriesResult.hasChanged) {
            // Update categories but preserve active filter selection
            setCategories(updatedCategories);
            setIncludedCategories(updatedCategories);
            /* istanbul ignore else */
            if (!filter) {
              setDisplayedCategories(updatedCategories);
            } else if (filter && !updatedCategories.some((c: string) => c.toLowerCase() === filter.toLowerCase())) {
              // Active category no longer exists: keep filter visible but show empty state
              setDisplayedCategories([filter]);
            }
          }
        }
      } catch (err) {
        const error = err as AxiosError;
        if (error.response) {
          // Server error
          showToast.error('Something went wrong. Data may be incomplete and user actions may not persist.');
        } else {
          // Network error
          const errorMessage = 'You may not be connected to the internet. Please check your connection.';
          showToast.error(`${errorMessage} Data may be incomplete and user actions may not persist.`);
        }
      }
    },
    parseInt(process.env.REACT_APP_POLLING_INTERVAL ?? '5000', 10),
  );

  // Register cleanup functions for memory management
  useEffect(() => {
    const cleanupFn = (): void => {
      // Clear any pending requests
      setPending(false);
      // Clear selected items to free memory
      setSelectedItems([]);
      // Clear items to delete
      setItemsToDelete([]);
    };
    registerCleanup(cleanupFn);
  }, [registerCleanup]);

  const handleAddItem = (newItems: IListItem[]): void => {
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

  const handleItemSelect = useCallback(
    (item: IListItem): void => {
      exportedHandleItemSelect({
        item,
        selectedItems,
        setSelectedItems,
      });
    },
    [selectedItems],
  );

  const handleItemEdit = useCallback(
    (item: IListItem): void => {
      if (selectedItems.length > 1) {
        // Bulk edit - navigate with selected item IDs
        const itemIds = selectedItems.map((selectedItem) => selectedItem.id).join(',');
        navigate(`/lists/${props.list.id}/list_items/bulk-edit?item_ids=${itemIds}`);
      } else {
        // Single edit
        exportedHandleItemEdit({
          item,
          listId: props.list.id!,
          navigate,
        });
      }
    },
    [selectedItems, props.list.id, navigate],
  );

  const handleItemComplete = useCallback(
    async (item: IListItem): Promise<void> => {
      const itemsToComplete = selectedItems.length ? selectedItems : [item];

      // Optimistic update - move items to completed immediately
      const updatedNotCompletedItems = notCompletedItems.filter(
        (item) => !itemsToComplete.some((completeItem) => completeItem.id === item.id),
      );
      const updatedCompletedItems = sortItemsByCreatedAt([
        ...completedItems,
        ...itemsToComplete.map((item) => ({ ...item, completed: true })),
      ]);

      setNotCompletedItems(updatedNotCompletedItems);
      setCompletedItems(updatedCompletedItems);

      // Clear selections
      setSelectedItems([]);
      setIncompleteMultiSelect(false);
      setCompleteMultiSelect(false);

      // Execute operations in parallel
      const results = await executeBulkOperations(itemsToComplete, {
        executeOperation: (itemToComplete) =>
          exportedHandleItemComplete({
            item: itemToComplete,
            listId: props.list.id!,
            setPending,
            navigate,
          }),
        successMessage: (items) => `${pluralize(items)} marked as completed.`,
        failureMessage: (successful, failed) =>
          `Some items failed to complete. ${pluralize(successful)} completed successfully. ` +
          `${pluralize(failed)} failed.`,
        allFailureMessage: 'Failed to complete items',
        navigate,
      });

      // Rollback failed items
      const failures = results.filter((r) => !r.success).map((r) => r.item);
      if (failures.length > 0) {
        const failedItemIds = failures.map((item) => item.id);
        const rollbackNotCompletedItems = sortItemsByCreatedAt([
          ...updatedNotCompletedItems,
          ...failures.map((item) => ({ ...item, completed: false })),
        ]);
        const rollbackCompletedItems = sortItemsByCreatedAt(
          updatedCompletedItems.filter((item) => !failedItemIds.includes(item.id)),
        );

        setNotCompletedItems(rollbackNotCompletedItems);
        setCompletedItems(rollbackCompletedItems);
      }
    },
    [
      selectedItems,
      notCompletedItems,
      completedItems,
      setNotCompletedItems,
      setCompletedItems,
      setSelectedItems,
      setIncompleteMultiSelect,
      setCompleteMultiSelect,
      props.list.id,
      navigate,
    ],
  );

  const handleItemRefresh = useCallback(
    async (item: IListItem): Promise<void> => {
      const itemsToRefresh = selectedItems.length ? selectedItems : [item];

      // Optimistic update - move items from completed to not completed immediately
      const updatedCompletedItems = completedItems.filter(
        (item) => !itemsToRefresh.some((refreshItem) => refreshItem.id === item.id),
      );
      // Create optimistic items with temporary unique IDs to avoid key conflicts
      const optimisticNewItems = itemsToRefresh.map((item, index) => ({
        ...item,
        completed: false,
        id: `optimistic-${item.id}-${Date.now()}-${index}`, // Temporary unique ID
      }));
      const updatedNotCompletedItems = sortItemsByCreatedAt([...notCompletedItems, ...optimisticNewItems]);

      setCompletedItems(updatedCompletedItems);
      setNotCompletedItems(updatedNotCompletedItems);

      // Clear selections
      setSelectedItems([]);
      setCompleteMultiSelect(false);
      setIncompleteMultiSelect(false);

      // Execute operations in parallel
      const results = await executeBulkOperations<IListItem>(itemsToRefresh, {
        executeOperation: (itemToRefresh) =>
          exportedHandleItemRefresh({
            item: itemToRefresh,
            listId: props.list.id!,
            completedItems: updatedCompletedItems,
            setCompletedItems,
            notCompletedItems: updatedNotCompletedItems,
            setNotCompletedItems,
            setPending,
            navigate,
            skipStateUpdate: true, // We handle state optimistically
          }),
        successMessage: (items) => `${pluralize(items)} refreshed successfully.`,
        failureMessage: (successful, failed) =>
          `Some items failed to refresh. ${pluralize(successful)} refreshed successfully. ${pluralize(failed)} failed.`,
        allFailureMessage: 'Failed to refresh items',
        navigate,
      });

      // Replace optimistic items with actual new items from API
      const successfulResults = results.filter((r) => r.success && r.result);
      if (successfulResults.length > 0) {
        const newItems = successfulResults.map((r) => r.result!);
        const itemsWithoutOptimistic = updatedNotCompletedItems.filter((item) => !item.id.startsWith('optimistic-'));
        const finalNotCompletedItems = sortItemsByCreatedAt([...itemsWithoutOptimistic, ...newItems]);
        setNotCompletedItems(finalNotCompletedItems);
      }

      // Rollback failed items
      const failures = results.filter((r) => !r.success).map((r) => r.item);
      if (failures.length > 0) {
        const failedItemIds = failures.map((item) => item.id);
        const rollbackCompletedItems = sortItemsByCreatedAt([
          ...updatedCompletedItems,
          ...failures.map((item) => ({ ...item, completed: true })),
        ]);
        const rollbackNotCompletedItems = updatedNotCompletedItems.filter((item) => {
          if (!item.id.startsWith('optimistic-')) {
            return true;
          }
          const originalId = item.id.replace(/^optimistic-([^-]+)-.*$/, '$1');
          return !failedItemIds.includes(originalId);
        });

        setCompletedItems(rollbackCompletedItems);
        setNotCompletedItems(rollbackNotCompletedItems);
      }
    },
    [
      selectedItems,
      completedItems,
      notCompletedItems,
      setCompletedItems,
      setNotCompletedItems,
      setSelectedItems,
      setCompleteMultiSelect,
      setIncompleteMultiSelect,
      props.list.id,
      navigate,
    ],
  );

  // Multi-select and bulk operation handlers
  const handleDelete = useCallback(
    (item: IListItem): void => {
      const items = selectedItems.length ? selectedItems : [item];
      setItemsToDelete(items);
      setShowDeleteConfirm(true);
    },
    [selectedItems],
  );

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

    // Update categories after deletion
    const updateCategories = (items: IListItem[]): void => {
      const updatedCategories = extractCategoriesFromItems(items);
      setCategories(updatedCategories);
      setIncludedCategories(updatedCategories);
      if (!filter) {
        setDisplayedCategories(updatedCategories);
      }
    };

    updateCategories([...updatedCompletedItems, ...updatedNotCompletedItems]);

    // Clear selections
    setSelectedItems([]);
    setIncompleteMultiSelect(false);
    setCompleteMultiSelect(false);
    setItemsToDelete([]);

    // Execute operations in parallel
    const results = await executeBulkOperations(itemsToDeleteFromState, {
      executeOperation: (item) =>
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
          skipStateUpdate: true, // We handle state optimistically
        }),
      successMessage: (items) => `${pluralize(items)} successfully deleted.`,
      failureMessage: (successful, failed) =>
        `Some items failed to delete. ${pluralize(successful)} deleted successfully. ${pluralize(failed)} failed.`,
      allFailureMessage: 'Failed to delete items',
      allFailureToastMessage: 'Failed to delete items. Please try again.',
      navigate,
    });

    // Rollback failed items
    const failures = results.filter((r) => !r.success).map((r) => r.item);
    if (failures.length > 0) {
      const rollbackCompletedItems = sortItemsByCreatedAt([
        ...updatedCompletedItems,
        ...failures.filter((item) => completedItems.some((orig) => orig.id === item.id)),
      ]);
      const rollbackNotCompletedItems = sortItemsByCreatedAt([
        ...updatedNotCompletedItems,
        ...failures.filter((item) => notCompletedItems.some((orig) => orig.id === item.id)),
      ]);

      setCompletedItems(rollbackCompletedItems);
      setNotCompletedItems(rollbackNotCompletedItems);
      updateCategories([...rollbackCompletedItems, ...rollbackNotCompletedItems]);
    } else {
      // All succeeded - ensure categories are consistent
      updateCategories([...updatedCompletedItems, ...updatedNotCompletedItems]);
    }
  };

  const handleMove = (): void => {
    if (!move) {
      return;
    }
    // Remove items from both not completed and completed since they've been moved to another list
    const updatedNotCompletedItems = notCompletedItems.filter(
      (item) => !selectedItems.some((selected) => selected.id === item.id),
    );
    const updatedCompletedItems = completedItems.filter(
      (item) => !selectedItems.some((selected) => selected.id === item.id),
    );

    setNotCompletedItems(updatedNotCompletedItems);
    setCompletedItems(updatedCompletedItems);

    // Update categories after move
    const updatedCategories = extractCategoriesFromItems([...updatedNotCompletedItems, ...updatedCompletedItems]);
    setCategories(updatedCategories);
    setIncludedCategories(updatedCategories);
    if (!filter) {
      setDisplayedCategories(updatedCategories);
    }

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
  const handleCategoryFilter = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setFilter(event.target.name);
    setDisplayedCategories([event.target.name]);
  }, []);

  const handleClearFilter = useCallback((): void => {
    setFilter('');
    setDisplayedCategories(includedCategories);
  }, [includedCategories]);

  return (
    <React.Fragment>
      {(copy || move) && (
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
      )}
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
          preloadedFieldConfigurations={props.listItemFieldConfigurations}
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
      <NotCompletedItemsSection
        notCompletedItems={notCompletedItems}
        permissions={props.permissions}
        selectedItems={selectedItems}
        pending={pending}
        filter={filter}
        displayedCategories={displayedCategories}
        incompleteMultiSelect={incompleteMultiSelect}
        setCopy={setCopy}
        setMove={setMove}
        setSelectedItems={setSelectedItems}
        setIncompleteMultiSelect={setIncompleteMultiSelect}
        handleItemSelect={handleItemSelect}
        handleItemComplete={handleItemComplete}
        handleItemEdit={handleItemEdit}
        handleItemDelete={handleDelete}
        handleItemRefresh={handleItemRefresh}
      />

      <CompletedItemsSection
        completedItems={completedItems}
        permissions={props.permissions}
        selectedItems={selectedItems}
        pending={pending}
        completeMultiSelect={completeMultiSelect}
        setCopy={setCopy}
        setMove={setMove}
        setSelectedItems={setSelectedItems}
        setCompleteMultiSelect={setCompleteMultiSelect}
        handleItemSelect={handleItemSelect}
        handleItemComplete={handleItemComplete}
        handleItemEdit={handleItemEdit}
        handleItemDelete={handleDelete}
        handleItemRefresh={handleItemRefresh}
      />
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
