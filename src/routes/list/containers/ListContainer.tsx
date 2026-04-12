import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import ConfirmModal from 'components/ConfirmModal';
import { PageLayout } from 'components/layout/PageLayout';
import { FilterChip, FilterChipGroup } from 'components/ui/FilterChip';
import { BottomInputBar } from 'components/layout/BottomInputBar';
import {
  EUserPermissions,
  EListItemFieldType,
  type IList,
  type IListItemConfiguration,
  type IListItemFieldConfiguration,
  type IListUser,
  type IListItem,
} from 'typings';
import { usePolling } from 'hooks';
import { useMobileSafariOptimizations } from 'hooks/useMobileSafariOptimizations';
import axios from 'utils/api';

import { MultiSelectBar, type IMultiSelectAction } from 'components/domain/MultiSelectBar';
import { CheckIcon, EditIcon, RedoIcon, TrashIcon } from 'components/icons';
import ChangeOtherListModal from '../components/ChangeOtherListModal';
import NotCompletedItemsSection from '../components/NotCompletedItemsSection';
import CompletedItemsSection from '../components/CompletedItemsSection';
import EditItemSheet from '../components/EditItemSheet';
import BulkEditSheet from '../components/BulkEditSheet';
import ListItemFormFields from '../components/ListItemFormFields';
import { fetchList, itemName } from '../utils';
import {
  handleAddItem as exportedHandleAddItem,
  handleItemSelect as exportedHandleItemSelect,
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
  listItemFieldConfigurations?: {
    id: string;
    label: string;
    data_type: EListItemFieldType;
    position: number;
    primary: boolean;
  }[];
  initialEditingItemId?: string | null;
  initialBulkEditOpen?: boolean;
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
  const [multiSelectActive, setMultiSelectActive] = useState(false);
  const [displayedCategories, setDisplayedCategories] = useState(props.categories);
  const [completedExpanded, setCompletedExpanded] = useState(props.completedItems.length <= 5);
  const [inputBarExpanded, setInputBarExpanded] = useState(props.notCompletedItems.length === 0);

  // Bottom sheet state
  const [editingItemId, setEditingItemId] = useState<string | null>(props.initialEditingItemId ?? null);
  const [bulkEditOpen, setBulkEditOpen] = useState(props.initialBulkEditOpen ?? false);
  const [copyMoveSheet, setCopyMoveSheet] = useState<{ mode: 'copy' | 'move' } | null>(null);

  // Quick add form state
  const [quickAddFormData, setQuickAddFormData] = useState<Record<string, string>>({});
  const [quickAddFieldConfigs, setQuickAddFieldConfigs] = useState(props.listItemFieldConfigurations);

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
          fetchList({ id: props.list.id ?? '', navigate, signal: new AbortController().signal }),
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
    parseInt(import.meta.env.VITE_POLLING_INTERVAL ?? '5000', 10),
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
        // Bulk edit - open sheet
        setBulkEditOpen(true);
      } else {
        // Single edit - open sheet
        setEditingItemId(item.id);
      }
    },
    [selectedItems.length],
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
      setInputBarExpanded(false);

      // Clear selections
      setSelectedItems([]);
      setMultiSelectActive(false);

      // Execute operations in parallel
      const results = await executeBulkOperations(itemsToComplete, {
        executeOperation: (itemToComplete) =>
          exportedHandleItemComplete({
            item: itemToComplete,
            listId: props.list.id ?? '',
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
      setMultiSelectActive,
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
      setMultiSelectActive(false);

      // Execute operations in parallel
      const results = await executeBulkOperations<IListItem>(itemsToRefresh, {
        executeOperation: (itemToRefresh) =>
          exportedHandleItemRefresh({
            item: itemToRefresh,
            listId: props.list.id ?? '',
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
        const newItems = successfulResults.map((r) => r.result as IListItem);
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
      setMultiSelectActive,
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
    setMultiSelectActive(false);
    setItemsToDelete([]);

    // Execute operations in parallel
    const results = await executeBulkOperations(itemsToDeleteFromState, {
      executeOperation: (item) =>
        exportedHandleItemDelete({
          item,
          listId: props.list.id ?? '',
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
    setMultiSelectActive(false);
  };

  const deleteConfirmationModalBody = (): string => {
    const itemNames = itemsToDelete.map((item) => itemName(item));
    return `Are you sure you want to delete the following items? ${itemNames.join(', ')}`;
  };

  const handleQuickAddFormChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setQuickAddFormData({
      ...quickAddFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuickAdd = async (value: string): Promise<void> => {
    if (!props.listItemConfiguration?.id) {
      showToast.error('No field configuration available for this list. Please contact support.');
      return;
    }

    try {
      setPending(true);

      const { data: newItem } = await axios.post(`/lists/${props.list.id}/list_items`, {
        list_item: {
          user_id: props.userId,
          completed: false,
        },
      });

      const { data: fieldConfigurations } = await axios.get(
        `/list_item_configurations/${props.listItemConfiguration.id}/list_item_field_configurations`,
      );

      const primaryFieldConfig = fieldConfigurations.find((config: { primary: boolean }) => config.primary === true);

      if (primaryFieldConfig) {
        const fieldPayload = { list_item_field: { data: value } };
        await axios.post(`/list_items/${newItem.id}/list_item_fields`, fieldPayload);
      }

      const itemWithFields = { ...newItem, list_item_fields: [{ label: primaryFieldConfig?.label, data: value }] };

      handleAddItem([itemWithFields]);
      setInputBarExpanded(true);
      setPending(false);
    } catch {
      showToast.error('Failed to add item');
      setPending(false);
    }
  };

  const permissionsDict: Record<string, 'read' | 'write'> = {
    [props.list.id ?? '']: props.permissions === EUserPermissions.WRITE ? 'write' : 'read',
  };

  const getQuickAddExpandedContent = (): React.ReactNode => {
    const configs = quickAddFieldConfigs ?? [];
    if (configs.length === 0) {
      return null;
    }

    return (
      <ListItemFormFields
        fieldConfigurations={configs}
        fields={Object.entries(quickAddFormData).map(([label, data], index) => ({
          id: `form-${label}`,
          label,
          data,
          list_item_id: '',
          list_item_field_configuration_id: '',
          archived_at: null,
          user_id: '',
          created_at: '',
          updated_at: null,
          position: index,
          data_type: EListItemFieldType.FREE_TEXT,
        }))}
        setFormData={handleQuickAddFormChange}
        editForm={false}
      />
    );
  };

  const handleQuickAddFormOpen = (): void => {
    // Fetch field configurations when form is opened if not preloaded
    if (!quickAddFieldConfigs && props.listItemConfiguration?.id) {
      axios
        .get(`/list_item_configurations/${props.listItemConfiguration.id}/list_item_field_configurations`)
        .then((response) => {
          // Only set if response is an array
          if (Array.isArray(response.data)) {
            setQuickAddFieldConfigs(response.data);
          }
        })
        .catch(() => {
          // Silently fail - form just won't show fields
        });
    }
  };

  const handleQuickAddClick = (): void => {
    const inputElement = document.querySelector('[data-test-id="quick-add-input"]') as HTMLInputElement;
    if (inputElement) {
      const value = inputElement.value.trim();
      if (value) {
        handleQuickAdd(value);
        inputElement.value = '';
        setQuickAddFormData({});
      }
    }
  };

  const renderFilterChips = (): React.JSX.Element => {
    const allCategories = includedCategories.filter(
      (c) => c !== 'uncategorized' && c !== '' && notCompletedItems.some((item) => item.category === c),
    );

    const hasUncategorized = notCompletedItems.some((item) => !item.category);

    return (
      <FilterChipGroup className="tw:py-2">
        <FilterChip
          label="All"
          active={filter === ''}
          onClick={() => {
            setFilter('');
            setDisplayedCategories(includedCategories);
          }}
          testId="clear-filter"
        />
        {allCategories.map((category) => (
          <FilterChip
            key={category}
            label={category}
            active={filter === category}
            onClick={() => {
              if (filter === category) {
                setFilter('');
                setDisplayedCategories(includedCategories);
              } else {
                setFilter(category);
                setDisplayedCategories([category]);
              }
            }}
            testId={`filter-by-${category.toLowerCase()}`}
          />
        ))}
        {hasUncategorized && (
          <FilterChip
            label="Other"
            active={filter === 'uncategorized'}
            onClick={() => {
              if (filter === 'uncategorized') {
                setFilter('');
                setDisplayedCategories(includedCategories);
              } else {
                setFilter('uncategorized');
                setDisplayedCategories(['uncategorized']);
              }
            }}
            testId="filter-by-uncategorized"
          />
        )}
      </FilterChipGroup>
    );
  };

  const getMultiSelectActions = (): IMultiSelectAction[] => {
    const hasNotCompleted = selectedItems.some((item) => !item.completed);
    const hasCompleted = selectedItems.some((item) => item.completed);
    const actions: IMultiSelectAction[] = [];

    if (hasNotCompleted && !hasCompleted) {
      actions.push({
        icon: <CheckIcon size="sm" />,
        label: 'Complete',
        onClick: () => handleItemComplete(selectedItems[0]),
        variant: 'success',
        testId: 'complete-selected',
      });
      actions.push({
        icon: <span className="tw:text-xs tw:font-bold">CP</span>,
        label: 'Copy to list',
        onClick: () => setCopyMoveSheet({ mode: 'copy' }),
        testId: 'copy-to-list',
      });
      actions.push({
        icon: <span className="tw:text-xs tw:font-bold">MV</span>,
        label: 'Move to list',
        onClick: () => setCopyMoveSheet({ mode: 'move' }),
        testId: 'move-to-list',
      });
      actions.push({
        icon: <EditIcon size="sm" />,
        label: 'Bulk Edit',
        onClick: () => setBulkEditOpen(true),
        testId: 'bulk-edit',
      });
    }

    if (hasCompleted && !hasNotCompleted) {
      actions.push({
        icon: <RedoIcon size="sm" />,
        label: 'Refresh',
        onClick: () => handleItemRefresh(selectedItems[0]),
        variant: 'success',
        testId: 'refresh-selected',
      });
    }

    actions.push({
      icon: <TrashIcon size="sm" />,
      label: 'Delete',
      onClick: () => handleDelete(selectedItems[0]),
      variant: 'danger',
      testId: 'delete-selected',
    });

    return actions;
  };

  return (
    <React.Fragment>
      {editingItemId && (
        <EditItemSheet
          listId={props.list.id ?? ''}
          itemId={editingItemId}
          onClose={(): void => setEditingItemId(null)}
          onSave={(): void => {
            setEditingItemId(null);
            // Refetch list data
            const listId = props.list.id;
            if (listId) {
              listDeduplicator
                .execute(`list-${listId}`, () =>
                  fetchList({ id: listId, navigate, signal: new AbortController().signal }),
                )
                .catch(() => {
                  // Silently handle refetch errors
                });
            }
          }}
        />
      )}
      {bulkEditOpen && props.listItemConfiguration && (
        <BulkEditSheet
          listId={props.list.id ?? ''}
          items={selectedItems}
          lists={props.listsToUpdate}
          categories={categories}
          listItemConfiguration={props.listItemConfiguration}
          listItemFieldConfigurations={(props.listItemFieldConfigurations ?? []) as IListItemFieldConfiguration[]}
          onClose={(): void => setBulkEditOpen(false)}
          onSave={(): void => {
            setBulkEditOpen(false);
            setSelectedItems([]);
            setMultiSelectActive(false);
            // Refetch list data
            const listId = props.list.id;
            if (listId) {
              listDeduplicator
                .execute(`list-${listId}`, () =>
                  fetchList({ id: listId, navigate, signal: new AbortController().signal }),
                )
                .catch(() => {
                  // Silently handle refetch errors
                });
            }
          }}
        />
      )}
      {copyMoveSheet && (
        <ChangeOtherListModal
          show={true}
          setShow={(): void => setCopyMoveSheet(null)}
          copy={copyMoveSheet.mode === 'copy'}
          move={copyMoveSheet.mode === 'move'}
          currentList={props.list}
          lists={props.listsToUpdate}
          items={selectedItems}
          setSelectedItems={setSelectedItems}
          setIncompleteMultiSelect={setMultiSelectActive}
          setCompleteMultiSelect={setMultiSelectActive}
          handleMove={handleMove}
          useBottomSheet={true}
        />
      )}
      <PageLayout
        showBackButton
        backTo="/lists"
        title={props.list.name}
        headerRight={
          props.permissions === EUserPermissions.WRITE ? (
            <button
              type="button"
              className={
                'tw:px-4 tw:py-2 tw:rounded-lg tw:bg-[var(--color-primary)] ' +
                'tw:text-white tw:text-sm tw:font-medium'
              }
              onClick={() => setMultiSelectActive(!multiSelectActive)}
              data-test-id="select-button"
            >
              {multiSelectActive ? 'Hide Select' : 'Select'}
            </button>
          ) : null
        }
        bottomBar={
          props.permissions === EUserPermissions.WRITE ? (
            <>
              <BottomInputBar
                placeholder="Add an item..."
                onSubmit={handleQuickAdd}
                initialExpanded={inputBarExpanded}
                expandedContent={getQuickAddExpandedContent()}
                onInputFocus={handleQuickAddFormOpen}
              />
              <button
                type="button"
                className={[
                  'tw:fixed tw:bottom-[calc(var(--spacing-nav-height)+8px)] tw:right-4 tw:z-40',
                  'tw:px-4 tw:py-2 tw:rounded-lg tw:bg-[var(--color-primary)]',
                  'tw:text-white tw:text-sm tw:font-medium',
                ].join(' ')}
                onClick={handleQuickAddClick}
              >
                Add
              </button>
            </>
          ) : undefined
        }
      >
        {renderFilterChips()}
        {multiSelectActive && selectedItems.length > 0 && (
          <div className="tw:mb-3">
            <MultiSelectBar
              selectedCount={selectedItems.length}
              onClose={() => {
                setSelectedItems([]);
                setMultiSelectActive(false);
              }}
              actions={getMultiSelectActions()}
            />
          </div>
        )}
        <NotCompletedItemsSection
          notCompletedItems={notCompletedItems}
          permissions={props.permissions}
          permissionsDict={permissionsDict}
          selectedItems={selectedItems}
          pending={pending}
          filter={filter}
          displayedCategories={displayedCategories}
          incompleteMultiSelect={multiSelectActive}
          setCopy={(): void => setCopyMoveSheet({ mode: 'copy' })}
          setMove={(): void => setCopyMoveSheet({ mode: 'move' })}
          setSelectedItems={setSelectedItems}
          setIncompleteMultiSelect={setMultiSelectActive}
          handleItemSelect={handleItemSelect}
          handleItemComplete={handleItemComplete}
          handleItemEdit={handleItemEdit}
          handleItemDelete={handleDelete}
          handleItemRefresh={handleItemRefresh}
        />

        <CompletedItemsSection
          completedItems={completedItems}
          permissions={props.permissions}
          permissionsDict={permissionsDict}
          selectedItems={selectedItems}
          pending={pending}
          completeMultiSelect={multiSelectActive}
          setCopy={(): void => setCopyMoveSheet({ mode: 'copy' })}
          setMove={(): void => setCopyMoveSheet({ mode: 'move' })}
          setSelectedItems={setSelectedItems}
          setCompleteMultiSelect={setMultiSelectActive}
          handleItemSelect={handleItemSelect}
          handleItemComplete={handleItemComplete}
          handleItemEdit={handleItemEdit}
          handleItemDelete={handleDelete}
          handleItemRefresh={handleItemRefresh}
          completedExpanded={completedExpanded}
          setCompletedExpanded={setCompletedExpanded}
        />
      </PageLayout>
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
