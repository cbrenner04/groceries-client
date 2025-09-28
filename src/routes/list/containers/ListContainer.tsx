import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import ConfirmModal from 'components/ConfirmModal';
import { EUserPermissions, type IList, type IListItemConfiguration, type IListUser, type IListItem } from 'typings';
import { usePolling, useNavigationFocus } from 'hooks';

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
  handleToggleRead as exportedHandleToggleRead,
  sortItemsByCreatedAt,
} from './listHandlers';
import type { IFulfilledListData } from '../utils';
import { handleFailure } from 'utils/handleFailure';
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
  listItemFieldConfigurations?: { id: string; label: string; data_type: string; position: number }[];
}

const ListContainer: React.FC<IListContainerProps> = (props): React.JSX.Element => {
  const [pending, setPending] = useState(false);
  const [selectedItems, setSelectedItems] = useState([] as IListItem[]);
  const [notCompletedItems, setNotCompletedItems] = useState(props.notCompletedItems);
  const [completedItems, setCompletedItems] = useState(props.completedItems);
  const [categories, setCategories] = useState(props.categories);
  const [filter, setFilter] = useState('');
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

  // Immediate sync on navigation focus
  // This helps to reduce perceived staleness when users navigate between routes
  // Reduces unnecessary re-renders and prevents request storms
  useNavigationFocus(async () => {
    try {
      const fetchResponse = await listDeduplicator.execute(`list-${props.list.id}-focus`, () =>
        fetchList({ id: props.list.id!, navigate, signal: new AbortController().signal }),
      );
      /* istanbul ignore else */
      if (fetchResponse) {
        const {
          not_completed_items: updatedNotCompletedItems,
          completed_items: updatedCompletedItems,
          categories: updatedCategories,
        } = fetchResponse as IFulfilledListData;

        // Use cache to avoid unnecessary state updates
        const notCompletedCacheKey = `list-${props.list.id}-not-completed`;
        const completedCacheKey = `list-${props.list.id}-completed`;
        const categoriesCacheKey = `list-${props.list.id}-categories`;

        const notCompletedResult = listCache.get(notCompletedCacheKey, updatedNotCompletedItems);
        const completedResult = listCache.get(completedCacheKey, updatedCompletedItems);
        const categoriesResult = listCache.get(categoriesCacheKey, updatedCategories);

        /* istanbul ignore else */
        if (notCompletedResult.hasChanged) {
          setNotCompletedItems(updatedNotCompletedItems);
        }
        /* istanbul ignore else */
        if (completedResult.hasChanged) {
          setCompletedItems(updatedCompletedItems);
        }
        /* istanbul ignore else */
        if (categoriesResult.hasChanged) {
          setCategories(updatedCategories);
          setIncludedCategories(updatedCategories);
          /* istanbul ignore else */
          if (!filter) {
            setDisplayedCategories(updatedCategories);
          }
        }
      }
    } catch (_err) {
      // ignore; polling error path handles user feedback
    }
  });

  // Immediate sync on visibility regain
  useEffect(() => {
    function handleVisibility(): void {
      /* istanbul ignore else */
      if (document.visibilityState === 'visible') {
        void (async (): Promise<void> => {
          try {
            const controller = new AbortController();
            const fetchResponse = await fetchList({ id: props.list.id!, navigate, signal: controller.signal });
            /* istanbul ignore else */
            if (fetchResponse) {
              const {
                not_completed_items: updatedNotCompletedItems,
                completed_items: updatedCompletedItems,
                categories: updatedCategories,
              } = fetchResponse;

              // Use cache to avoid unnecessary state updates
              const notCompletedCacheKey = `list-${props.list.id}-not-completed`;
              const completedCacheKey = `list-${props.list.id}-completed`;
              const categoriesCacheKey = `list-${props.list.id}-categories`;

              const notCompletedResult = listCache.get(notCompletedCacheKey, updatedNotCompletedItems);
              const completedResult = listCache.get(completedCacheKey, updatedCompletedItems);
              const categoriesResult = listCache.get(categoriesCacheKey, updatedCategories);

              /* istanbul ignore else */
              if (notCompletedResult.hasChanged) {
                setNotCompletedItems(updatedNotCompletedItems);
              }
              /* istanbul ignore else */
              if (completedResult.hasChanged) {
                setCompletedItems(updatedCompletedItems);
              }
              /* istanbul ignore else */
              if (categoriesResult.hasChanged) {
                setCategories(updatedCategories);
                setIncludedCategories(updatedCategories);
                /* istanbul ignore else */
                if (!filter) {
                  setDisplayedCategories(updatedCategories);
                }
              }
            }
          } catch (_err) {
            // ignore; polling error path handles user feedback
          }
        })();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.list.id, filter]);

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
      const failures: IListItem[] = [];
      const successfulItems: IListItem[] = [];
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
        const rollbackNotCompletedItems = sortItemsByCreatedAt([
          ...updatedNotCompletedItems,
          ...failures.map((item) => ({ ...item!, completed: false })),
        ]);
        const rollbackCompletedItems = sortItemsByCreatedAt(
          updatedCompletedItems.filter((item) => !failedItemIds.includes(item.id)),
        );

        setNotCompletedItems(rollbackNotCompletedItems);
        setCompletedItems(rollbackCompletedItems);

        // Show appropriate feedback
        if (successfulItems.length > 0) {
          const pluralize = (items: IListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
          showToast.warning(
            `Some items failed to complete. ${pluralize(successfulItems)} completed successfully. ${pluralize(
              failures,
            )} failed.`,
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
        const pluralize = (items: IListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
        showToast.info(`${pluralize(itemsToComplete)} marked as completed.`);
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

      // Make API calls in parallel for better performance
      const apiPromises = itemsToRefresh.map(async (itemToRefresh, index) => {
        try {
          const newItem = await exportedHandleItemRefresh({
            item: itemToRefresh,
            listId: props.list.id!,
            completedItems: updatedCompletedItems,
            setCompletedItems,
            notCompletedItems: updatedNotCompletedItems,
            setNotCompletedItems,
            setPending,
            navigate,
            skipStateUpdate: true, // We handle state optimistically
          });
          return { success: true, item: itemToRefresh, newItem, index };
        } catch (error) {
          return { success: false, item: itemToRefresh, error, index };
        }
      });

      const results = await Promise.all(apiPromises);

      // Check for any failures and update state with actual new items
      const failures: IListItem[] = [];
      const successfulItems: IListItem[] = [];
      const newItems: IListItem[] = [];

      results.forEach((result) => {
        if (result.success) {
          successfulItems.push(result.item);
          if (result.newItem) {
            newItems.push(result.newItem);
          }
        } else {
          failures.push(result.item);
        }
      });

      // Replace optimistic items with actual new items from API
      if (successfulItems.length > 0) {
        // Remove optimistic items (they have temporary IDs starting with "optimistic-")
        const itemsWithoutOptimistic = updatedNotCompletedItems.filter((item) => !item.id.startsWith('optimistic-'));
        // Add the new items from API
        const finalNotCompletedItems = sortItemsByCreatedAt([...itemsWithoutOptimistic, ...newItems]);
        setNotCompletedItems(finalNotCompletedItems);
      }

      if (failures.length > 0) {
        // Some items failed - rollback only the failed items
        const failedItemIds = failures.map((item) => item.id);

        // Rollback failed items to original state
        const rollbackCompletedItems = sortItemsByCreatedAt([
          ...updatedCompletedItems,
          ...failures.map((item) => ({ ...item, completed: true })),
        ]);
        // Remove optimistic items for failed operations and keep everything else
        const rollbackNotCompletedItems = updatedNotCompletedItems.filter((item) => {
          // Keep items that are not optimistic
          if (!item.id.startsWith('optimistic-')) {
            return true;
          }
          // For optimistic items, check if their original item failed
          const originalId = item.id.replace(/^optimistic-([^-]+)-.*$/, '$1');
          return !failedItemIds.includes(originalId);
        });

        setCompletedItems(rollbackCompletedItems);
        setNotCompletedItems(rollbackNotCompletedItems);

        // Show appropriate feedback
        if (successfulItems.length > 0) {
          const pluralize = (items: IListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
          showToast.warning(
            `Some items failed to refresh. ${pluralize(successfulItems)} refreshed successfully. ${pluralize(
              failures,
            )} failed.`,
          );
        } else {
          // All items failed
          handleFailure({
            error: new Error('All items failed to refresh') as AxiosError,
            notFoundMessage: 'Failed to refresh items',
          });
        }
      } else {
        // All items succeeded
        const pluralize = (items: IListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
        showToast.info(`${pluralize(itemsToRefresh)} refreshed successfully.`);
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

  const toggleRead = useCallback(
    async (item: IListItem): Promise<void> => {
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
    },
    [
      selectedItems,
      props.list.id,
      completedItems,
      setCompletedItems,
      notCompletedItems,
      setNotCompletedItems,
      setSelectedItems,
      setIncompleteMultiSelect,
      setCompleteMultiSelect,
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

    // Update categories after deletion - remove categories that no longer have items
    const allRemainingItems = [...updatedCompletedItems, ...updatedNotCompletedItems];
    const remainingCategories = new Set<string>();
    allRemainingItems.forEach((item) => {
      const categoryField = item.fields.find((field) => field.label === 'category');
      if (categoryField?.data) {
        remainingCategories.add(categoryField.data);
      }
    });
    const updatedCategories = Array.from(remainingCategories);
    setCategories(updatedCategories);
    setIncludedCategories(updatedCategories);
    if (!filter) {
      setDisplayedCategories(updatedCategories);
    }

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
        skipStateUpdate: true, // We handle state optimistically
      }),
    );

    const results = await Promise.allSettled(apiPromises);

    // Check for any failures
    const failures: IListItem[] = [];
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

      // Recalculate categories after rollback
      const allItemsAfterRollback = [...rollbackCompletedItems, ...rollbackNotCompletedItems];
      const categoriesAfterRollback = new Set<string>();
      allItemsAfterRollback.forEach((item) => {
        const categoryField = item.fields.find((field) => field.label === 'category');
        if (categoryField?.data) {
          categoriesAfterRollback.add(categoryField.data);
        }
      });
      const updatedCategoriesAfterRollback = Array.from(categoriesAfterRollback);
      setCategories(updatedCategoriesAfterRollback);
      setIncludedCategories(updatedCategoriesAfterRollback);
      if (!filter) {
        setDisplayedCategories(updatedCategoriesAfterRollback);
      }

      // Show appropriate feedback
      if (successfulItems.length > 0) {
        const pluralize = (items: IListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
        showToast.warning(
          `Some items failed to delete. ${pluralize(successfulItems)} deleted successfully. ${pluralize(
            failures,
          )} failed.`,
        );
      } else {
        // All items failed
        showToast.error('Failed to delete items. Please try again.');
      }
    } else {
      // All items succeeded - ensure categories are consistent after successful deletion
      const finalAllItems = [...updatedCompletedItems, ...updatedNotCompletedItems];
      const finalCategories = new Set<string>();
      finalAllItems.forEach((item) => {
        const categoryField = item.fields.find((field) => field.label === 'category');
        if (categoryField?.data) {
          finalCategories.add(categoryField.data);
        }
      });
      const finalUpdatedCategories = Array.from(finalCategories);
      setCategories(finalUpdatedCategories);
      setIncludedCategories(finalUpdatedCategories);
      if (!filter) {
        setDisplayedCategories(finalUpdatedCategories);
      }

      const pluralize = (items: IListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
      showToast.info(`${pluralize(itemsToDeleteFromState)} successfully deleted.`);
    }
  };

  const handleMove = (): void => {
    if (!move) {
      return;
    }
    // Remove items from both not completed and completed since they've been moved to another list
    setNotCompletedItems(
      notCompletedItems.filter((item) => !selectedItems.some((selected) => selected.id === item.id)),
    );
    setCompletedItems(completedItems.filter((item) => !selectedItems.some((selected) => selected.id === item.id)));

    // Update categories after move - remove categories that no longer have items
    const remainingItems = [
      ...notCompletedItems.filter((item) => !selectedItems.some((selected) => selected.id === item.id)),
      ...completedItems.filter((item) => !selectedItems.some((selected) => selected.id === item.id)),
    ];
    const remainingCategories = new Set<string>();
    remainingItems.forEach((item) => {
      const categoryField = item.fields.find((field) => field.label === 'category');
      if (categoryField?.data) {
        remainingCategories.add(categoryField.data);
      }
    });
    const updatedCategories = Array.from(remainingCategories);
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
        listType={props.list.type}
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
        toggleItemRead={toggleRead}
      />

      <CompletedItemsSection
        completedItems={completedItems}
        permissions={props.permissions}
        selectedItems={selectedItems}
        pending={pending}
        listType={props.list.type}
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
        toggleItemRead={toggleRead}
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
