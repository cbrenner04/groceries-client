import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { CheckIcon, CopyIcon, EditIcon, MoveIcon, RedoIcon, TrashIcon, UsersIcon } from 'components/icons';
import ShareListSheet from '../../share_list/containers/ShareListSheet';
import ChangeOtherListModal from '../components/ChangeOtherListModal';
import NotCompletedItemsSection from '../components/NotCompletedItemsSection';
import CompletedItemsSection from '../components/CompletedItemsSection';
import { Button } from 'components/ui/Button';
import type { TListItemAnimationState } from 'components/domain/ListItemRow';
import EditItemSheet from '../components/EditItemSheet';
import BulkEditSheet from '../components/BulkEditSheet';
import ListItemFormFields from '../components/ListItemFormFields';
import CategoryField from 'components/FormFields/CategoryField';
import CheckboxField from 'components/FormFields/CheckboxField';
import { capitalize, normalizeCategoryKey } from 'utils/format';
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
import { useSessionMode } from 'hooks';

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
  initialShareSheetOpen?: boolean;
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
  const [itemAnimationStates, setItemAnimationStates] = useState<Record<string, TListItemAnimationState>>({});
  const itemAnimationTimers = useRef<Record<string, number>>({});

  // Bottom sheet state
  const [editingItemId, setEditingItemId] = useState<string | null>(props.initialEditingItemId ?? null);
  const [bulkEditOpen, setBulkEditOpen] = useState(props.initialBulkEditOpen ?? false);
  const [copyMoveSheet, setCopyMoveSheet] = useState<{ mode: 'copy' | 'move' } | null>(null);
  const [shareSheetOpen, setShareSheetOpen] = useState(props.initialShareSheetOpen ?? false);

  // Quick add form state
  const [quickAddFormData, setQuickAddFormData] = useState<Record<string, string>>({});
  const [quickAddFieldConfigs, setQuickAddFieldConfigs] = useState(props.listItemFieldConfigurations);
  // The always-visible bottom input bar IS the primary/name field for new items.
  const [quickAddPrimary, setQuickAddPrimary] = useState('');
  const [quickAddCategory, setQuickAddCategory] = useState('');
  const [quickAddCompleted, setQuickAddCompleted] = useState(false);

  // Aria-live announcement state for accessibility
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const navigate = useNavigate();
  const {
    mode: sessionMode,
    onItemAdded: onSessionItemAdded,
    onItemCompleted: onSessionItemCompleted,
  } = useSessionMode();

  const markItemAnimation = useCallback((itemIds: string[], animationState: TListItemAnimationState): void => {
    if (import.meta.env.VITEST === 'true') {
      return;
    }

    itemIds.forEach((itemId) => {
      window.clearTimeout(itemAnimationTimers.current[itemId]);
    });

    setItemAnimationStates((previous) =>
      itemIds.reduce(
        (next, itemId) => ({
          ...next,
          [itemId]: animationState,
        }),
        previous,
      ),
    );

    itemIds.forEach((itemId) => {
      itemAnimationTimers.current[itemId] = window.setTimeout(() => {
        setItemAnimationStates((previous) => {
          return Object.fromEntries(
            Object.entries(previous).filter(([animationItemId]) => animationItemId !== itemId),
          ) as Record<string, TListItemAnimationState>;
        });
        itemAnimationTimers.current = Object.fromEntries(
          Object.entries(itemAnimationTimers.current).filter(([timerItemId]) => timerItemId !== itemId),
        ) as Record<string, number>;
      }, 900);
    });
  }, []);

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

  useEffect(() => {
    return (): void => {
      Object.values(itemAnimationTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const handleAddItem = (newItems: IListItem[]): void => {
    markItemAnimation(
      newItems.map((item) => item.id),
      'added',
    );
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
    onSessionItemAdded();
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
      const completedCount = itemsToComplete.length;
      const itemsWord = completedCount === 1 ? 'item' : 'items';
      setLiveAnnouncement(`${completedCount} ${itemsWord} marked as completed`);
      markItemAnimation(
        itemsToComplete.map((item) => item.id),
        'completed',
      );
      onSessionItemCompleted();

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
        markItemAnimation(failedItemIds, 'rollback');
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
      setLiveAnnouncement,
      markItemAnimation,
      props.list.id,
      navigate,
      onSessionItemCompleted,
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
      const refreshCount = itemsToRefresh.length;
      const itemsWord = refreshCount === 1 ? 'item' : 'items';
      setLiveAnnouncement(`${refreshCount} ${itemsWord} refreshed`);
      markItemAnimation(
        optimisticNewItems.map((item) => item.id),
        'refreshed',
      );

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
        markItemAnimation(
          newItems.map((item) => item.id),
          'refreshed',
        );
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
          return !failedItemIds.some((failedItemId) => item.id.startsWith(`optimistic-${failedItemId}-`));
        });

        setCompletedItems(rollbackCompletedItems);
        setNotCompletedItems(rollbackNotCompletedItems);
        markItemAnimation(failedItemIds, 'rollback');
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
      setLiveAnnouncement,
      markItemAnimation,
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
    const deleteCount = itemsToDeleteFromState.length;
    const itemsWord = deleteCount === 1 ? 'item' : 'items';
    setLiveAnnouncement(`${deleteCount} ${itemsWord} deleted`);

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
      markItemAnimation(
        failures.map((item) => item.id),
        'rollback',
      );
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
    const { name, type, value, checked } = e.target;
    const next = type === 'checkbox' ? (checked ? 'true' : 'false') : value;
    setQuickAddFormData((prev) => ({
      ...prev,
      [name]: next,
    }));
  };

  const handleQuickAddFormSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!props.list?.id || !props.listItemConfiguration?.id) {
      return;
    }

    const configs = quickAddFieldConfigs ?? [];
    if (configs.length === 0) {
      return;
    }

    // The primary/name field is the always-visible bottom input bar (not part of the form DOM).
    const primaryName = quickAddPrimary.trim();
    if (primaryName === '') {
      return;
    }

    const formEl = event.currentTarget;

    try {
      setPending(true);
      const categoryEl = formEl.elements.namedItem('category');
      const categoryRaw = categoryEl instanceof HTMLInputElement ? String(categoryEl.value ?? '').trim() : '';
      const categoryMerged = categoryRaw || quickAddCategory.trim();
      const capitalizedCategory = categoryMerged ? capitalize(categoryMerged) : null;
      const completedEl = formEl.elements.namedItem('completed');
      const completedFlag = completedEl instanceof HTMLInputElement ? completedEl.checked : quickAddCompleted;

      const { data: newItem } = await axios.post(`/lists/${props.list.id}/list_items`, {
        list_item: {
          completed: completedFlag,
          ...(capitalizedCategory ? { category: capitalizedCategory } : {}),
        },
      });

      const resolvedFieldData = (config: (typeof configs)[0]): string => {
        const named = formEl.elements.namedItem(config.label);
        const fromState = quickAddFormData[config.label];
        if (config.data_type === EListItemFieldType.BOOLEAN) {
          if (named instanceof HTMLInputElement) {
            return named.checked ? 'true' : 'false';
          }
          return fromState === 'true' ? 'true' : 'false';
        }
        const fromDom = named instanceof HTMLInputElement ? String(named.value ?? '').trim() : '';
        const str = fromDom || String(fromState ?? '').trim();
        if (str !== '') {
          return str;
        }
        switch (config.data_type) {
          case EListItemFieldType.NUMBER:
            return '0';
          default:
            return '';
        }
      };

      await Promise.all(
        configs.flatMap((config) => {
          const data = config.primary ? primaryName : resolvedFieldData(config);
          if (data === '') {
            return [];
          }
          return [
            axios.post(`/lists/${props.list.id}/list_items/${newItem.id}/list_item_fields`, {
              list_item_field: {
                list_item_field_configuration_id: config.id,
                data,
              },
            }),
          ];
        }),
      );

      if (capitalizedCategory) {
        try {
          await axios.post(`/lists/${props.list.id}/categories`, { category: { name: capitalizedCategory } });
        } catch {
          // Category may already exist
        }
      }

      const { data: completeItem } = await axios.get(`/lists/${props.list.id}/list_items/${newItem.id}`);
      handleAddItem([completeItem]);
      setQuickAddFormData({});
      setQuickAddPrimary('');
      setQuickAddCategory('');
      setQuickAddCompleted(false);
      setInputBarExpanded(true);
      setPending(false);
    } catch {
      showToast.error('Failed to add item');
      setPending(false);
    }
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
      setQuickAddPrimary('');
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
      <form
        id="list-item-form"
        data-test-id="list-item-form"
        noValidate
        onSubmit={handleQuickAddFormSubmit}
        className="tw:pb-2"
      >
        <ListItemFormFields
          fieldConfigurations={configs.filter((config) => !config.primary)}
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
        <CategoryField
          category={quickAddCategory}
          categories={includedCategories}
          handleInput={(e: React.ChangeEvent<HTMLInputElement>): void => {
            setQuickAddCategory(e.target.value);
          }}
        />
        <CheckboxField
          name="completed"
          label="Completed"
          value={quickAddCompleted}
          handleChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
            setQuickAddCompleted(e.target.checked);
          }}
        />
      </form>
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

  const renderFilterChips = (): React.JSX.Element => {
    // Build chips from the categories actually present on the not-completed items, deduped
    // case-insensitively (mirrors how items are grouped). Previously this filtered
    // includedCategories with an exact === match, so a category on an item but missing from — or
    // cased differently than — includedCategories produced no chip.
    const categoryByKey = new Map<string, string>();
    notCompletedItems.forEach((item) => {
      const raw = item.category ? String(item.category).trim() : '';
      if (raw) {
        const key = normalizeCategoryKey(raw);
        if (!categoryByKey.has(key)) {
          categoryByKey.set(key, raw);
        }
      }
    });
    const allCategories = Array.from(categoryByKey.values()).sort((a, b) => a.localeCompare(b));

    const hasUncategorized = notCompletedItems.some((item) => !item.category);

    return (
      <FilterChipGroup className="tw:pt-2 tw:mb-4">
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
        icon: <CopyIcon size="sm" />,
        label: 'Copy to list',
        onClick: () => setCopyMoveSheet({ mode: 'copy' }),
        testId: 'copy-to-list',
      });
      actions.push({
        icon: <MoveIcon size="sm" />,
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
            const listId = props.list.id;
            if (listId) {
              void listDeduplicator
                .execute(`list-${listId}`, () =>
                  fetchList({ id: listId, navigate, signal: new AbortController().signal }),
                )
                .then((fetchResponse) => {
                  if (!fetchResponse) {
                    return;
                  }
                  const {
                    not_completed_items: updatedNotCompletedItems,
                    completed_items: updatedCompletedItems,
                    categories: updatedCategories,
                  } = fetchResponse as IFulfilledListData;
                  setNotCompletedItems(updatedNotCompletedItems);
                  setCompletedItems(updatedCompletedItems);
                  setCategories(updatedCategories);
                  setIncludedCategories(updatedCategories);
                  if (!filter) {
                    setDisplayedCategories(updatedCategories);
                  } else if (
                    filter &&
                    !updatedCategories.some((c: string) => c.toLowerCase() === filter.toLowerCase())
                  ) {
                    setDisplayedCategories([filter]);
                  }
                })
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
            const listId = props.list.id;
            if (listId) {
              void listDeduplicator
                .execute(`list-${listId}`, () =>
                  fetchList({ id: listId, navigate, signal: new AbortController().signal }),
                )
                .then((fetchResponse) => {
                  if (!fetchResponse) {
                    return;
                  }
                  const {
                    not_completed_items: updatedNotCompletedItems,
                    completed_items: updatedCompletedItems,
                    categories: updatedCategories,
                  } = fetchResponse as IFulfilledListData;
                  setNotCompletedItems(updatedNotCompletedItems);
                  setCompletedItems(updatedCompletedItems);
                  setCategories(updatedCategories);
                  setIncludedCategories(updatedCategories);
                  if (!filter) {
                    setDisplayedCategories(updatedCategories);
                  } else if (
                    filter &&
                    !updatedCategories.some((c: string) => c.toLowerCase() === filter.toLowerCase())
                  ) {
                    setDisplayedCategories([filter]);
                  }
                })
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
          setMultiSelectActive={setMultiSelectActive}
          handleMove={handleMove}
        />
      )}
      <ShareListSheet
        isOpen={shareSheetOpen}
        onClose={(): void => setShareSheetOpen(false)}
        listId={props.list.id ?? ''}
        listName={props.list.name}
      />
      <PageLayout
        showBackButton
        backTo="/lists"
        title={props.list.name}
        headerRight={
          props.permissions === EUserPermissions.WRITE ? (
            <div className="tw:flex tw:items-center tw:gap-2">
              <button
                type="button"
                className={
                  'tw:flex tw:items-center tw:justify-center tw:w-10 tw:h-10 tw:rounded-lg ' +
                  'tw:text-[var(--color-text-secondary)] tw:hover:bg-[var(--color-surface-overlay)] ' +
                  'tw:cursor-pointer tw:transition-colors'
                }
                onClick={() => setShareSheetOpen(true)}
                data-test-id="open-share-sheet"
                aria-label="Share list"
              >
                <UsersIcon size="sm" />
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMultiSelectActive(!multiSelectActive)}
                data-test-id="select-button"
              >
                {multiSelectActive ? 'Cancel' : 'Select Items'}
              </Button>
            </div>
          ) : null
        }
        bottomBar={
          props.permissions === EUserPermissions.WRITE ? (
            <BottomInputBar
              placeholder="Add an item..."
              onSubmit={handleQuickAdd}
              hidden={showDeleteConfirm || copyMoveSheet !== null}
              initialExpanded={inputBarExpanded}
              expandedContent={getQuickAddExpandedContent()}
              onInputFocus={handleQuickAddFormOpen}
              mode={sessionMode}
              submitFormId="list-item-form"
              submitLabel="Add item"
              value={quickAddPrimary}
              onValueChange={setQuickAddPrimary}
            />
          ) : undefined
        }
      >
        <div aria-live="polite" aria-atomic="true" className="tw:sr-only">
          {liveAnnouncement}
        </div>
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
          listItemFieldConfigurations={(props.listItemFieldConfigurations ?? []) as IListItemFieldConfiguration[]}
          incompleteMultiSelect={multiSelectActive}
          setSelectedItems={setSelectedItems}
          handleItemSelect={handleItemSelect}
          handleItemComplete={handleItemComplete}
          handleItemEdit={handleItemEdit}
          handleItemDelete={handleDelete}
          handleItemRefresh={handleItemRefresh}
          itemAnimationStates={itemAnimationStates}
          sessionMode={sessionMode}
        />

        <CompletedItemsSection
          completedItems={completedItems}
          permissions={props.permissions}
          permissionsDict={permissionsDict}
          selectedItems={selectedItems}
          pending={pending}
          filter={filter}
          displayedCategories={displayedCategories}
          listItemFieldConfigurations={(props.listItemFieldConfigurations ?? []) as IListItemFieldConfiguration[]}
          completeMultiSelect={multiSelectActive}
          setSelectedItems={setSelectedItems}
          handleItemSelect={handleItemSelect}
          handleItemComplete={handleItemComplete}
          handleItemEdit={handleItemEdit}
          handleItemDelete={handleDelete}
          handleItemRefresh={handleItemRefresh}
          completedExpanded={completedExpanded}
          setCompletedExpanded={setCompletedExpanded}
          itemAnimationStates={itemAnimationStates}
          sessionMode={sessionMode}
          hasNotCompletedItems={notCompletedItems.length > 0}
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
