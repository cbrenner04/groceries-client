import { showToast as toastUtil } from '../../../utils/toast';
import type { AxiosError } from 'axios';
import axios from '../../../utils/api';
import update from 'immutability-helper';
import { EListItemFieldType, type IListItem } from 'typings';
import { handleFailure } from '../../../utils/handleFailure';
import { getFieldConfigurations } from '../../../utils/fieldConfigCache';

// Cache for memoized sorting results
export const sortingCache = new Map<string, IListItem[]>();
const CACHE_SIZE_LIMIT = 50; // Limit cache size to prevent memory leaks

// Generate cache key based on items' IDs and created_at only (updated_at can change frequently)
const generateSortCacheKey = (items: IListItem[]): string => {
  return items
    .map((item) => `${item.id}:${item.created_at}`)
    .sort() // Sort to ensure consistent key regardless of input order
    .join('|');
};

// Sort items by created_at in ascending order to match server ordering (memoized)
export const sortItemsByCreatedAt = (items: IListItem[]): IListItem[] => {
  if (items.length === 0) {
    return [];
  }

  if (items.length === 1) {
    return [...items];
  }

  const cacheKey = generateSortCacheKey(items);

  // Check cache first
  if (sortingCache.has(cacheKey)) {
    return sortingCache.get(cacheKey)!;
  }

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateA - dateB;
  });

  // Cache the result (with size limit to prevent memory leaks)
  if (sortingCache.size >= CACHE_SIZE_LIMIT) {
    // Remove oldest entry (first key)
    const firstKey = sortingCache.keys().next().value;
    sortingCache.delete(firstKey);
  }

  sortingCache.set(cacheKey, sortedItems);
  return sortedItems;
};

// handleAddItem
export function handleAddItem(params: {
  newItems: IListItem[];
  pending: boolean;
  setPending: (v: boolean) => void;
  completedItems: IListItem[];
  setCompletedItems: (v: IListItem[]) => void;
  notCompletedItems: IListItem[];
  setNotCompletedItems: (v: IListItem[]) => void;
  categories: string[];
  setCategories: (v: string[]) => void;
  includedCategories?: string[];
  setIncludedCategories?: (v: string[]) => void;
  displayedCategories?: string[];
  setDisplayedCategories?: (v: string[]) => void;
  filter?: string;
  navigate?: (url: string) => void;
}): void {
  const {
    newItems,
    setPending,
    completedItems,
    setCompletedItems,
    notCompletedItems,
    setNotCompletedItems,
    categories,
    setCategories,
    setIncludedCategories,
    setDisplayedCategories,
    filter,
    navigate,
  } = params;
  setPending(true);
  try {
    const newItem = newItems[0];
    const itemWithFields = {
      ...newItem,
      fields: newItem.fields,
    };
    const itemCategory = itemWithFields.fields.find((f) => f.label === 'category')?.data;
    if (itemWithFields.completed) {
      const updatedCompletedItems = sortItemsByCreatedAt([...completedItems, itemWithFields]);
      setCompletedItems(updatedCompletedItems);
    } else {
      const updatedNotCompletedItems = sortItemsByCreatedAt([...notCompletedItems, itemWithFields]);
      setNotCompletedItems(updatedNotCompletedItems);
    }
    if (itemCategory && !categories.includes(itemCategory)) {
      const newCategories = [...categories, itemCategory];
      setCategories(newCategories);
      if (setIncludedCategories) {
        setIncludedCategories(newCategories);
      }
      if (setDisplayedCategories && !filter) {
        setDisplayedCategories(newCategories);
      }
    }
    toastUtil.info('Item successfully added.');
  } catch (err) {
    handleFailure({ error: err as AxiosError, notFoundMessage: 'Failed to add item', navigate, redirectURI: '/lists' });
  } finally {
    setPending(false);
  }
}

// handleItemSelect
export function handleItemSelect(params: {
  item: IListItem;
  selectedItems: IListItem[];
  setSelectedItems: (v: IListItem[]) => void;
}): void {
  const { item, selectedItems, setSelectedItems } = params;
  const isSelected = selectedItems.some((selectedItem) => selectedItem.id === item.id);
  if (isSelected) {
    setSelectedItems(selectedItems.filter((selectedItem) => selectedItem.id !== item.id));
  } else {
    setSelectedItems(update(selectedItems, { $push: [item] }));
  }
}

// handleItemEdit
export function handleItemEdit(params: { item: IListItem; listId: string; navigate: (url: string) => void }): void {
  const { item, listId, navigate } = params;
  navigate(`/lists/${listId}/list_items/${item.id}/edit`);
}

// handleItemComplete
export async function handleItemComplete(params: {
  item: IListItem;
  listId: string;
  setPending: (v: boolean) => void;
  navigate?: (url: string) => void;
}): Promise<void> {
  const { item, listId, setPending, navigate } = params;
  setPending(true);
  try {
    await axios.put(`/v2/lists/${listId}/list_items/${item.id}`, { list_item: { completed: true } });
  } catch (err) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'Failed to complete item',
      navigate,
      redirectURI: '/lists',
    });
    throw err; // Re-throw the error so the caller can handle it
  } finally {
    setPending(false);
  }
}

// handleItemDelete
export async function handleItemDelete(params: {
  item: IListItem;
  listId: string;
  completedItems: IListItem[];
  setCompletedItems: (v: IListItem[]) => void;
  notCompletedItems: IListItem[];
  setNotCompletedItems: (v: IListItem[]) => void;
  selectedItems: IListItem[];
  setSelectedItems: (v: IListItem[]) => void;
  setPending: (v: boolean) => void;
  navigate?: (url: string) => void;
  showToast?: boolean;
  skipStateUpdate?: boolean;
}): Promise<void> {
  const {
    item,
    listId,
    completedItems,
    setCompletedItems,
    notCompletedItems,
    setNotCompletedItems,
    selectedItems,
    setSelectedItems,
    setPending,
    navigate,
    showToast = true,
    skipStateUpdate = false,
  } = params;
  setPending(true);
  try {
    await axios.delete(`/v2/lists/${listId}/list_items/${item.id}`);
    if (!skipStateUpdate) {
      if (item.completed) {
        setCompletedItems(completedItems.filter((completedItem) => completedItem.id !== item.id));
      } else {
        setNotCompletedItems(notCompletedItems.filter((notCompletedItem) => notCompletedItem.id !== item.id));
      }
      setSelectedItems(selectedItems.filter((selectedItem) => selectedItem.id !== item.id));
      if (showToast) {
        toastUtil.info('Item successfully deleted.');
      }
    }
  } catch (err) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'Failed to delete item',
      navigate,
      redirectURI: '/lists',
    });
    throw err; // Re-throw the error so the caller can handle it
  } finally {
    setPending(false);
  }
}

// handleItemRefresh
export async function handleItemRefresh(params: {
  item: IListItem;
  listId: string;
  completedItems: IListItem[];
  setCompletedItems: (v: IListItem[]) => void;
  notCompletedItems: IListItem[];
  setNotCompletedItems: (v: IListItem[]) => void;
  setPending: (v: boolean) => void;
  navigate?: (url: string) => void;
  skipStateUpdate?: boolean;
}): Promise<IListItem> {
  const {
    item,
    listId,
    completedItems,
    setCompletedItems,
    notCompletedItems,
    setNotCompletedItems,
    setPending,
    navigate,
    skipStateUpdate = false,
  } = params;
  setPending(true);
  try {
    // Step 1: Create a new list item with basic data (no fields)
    const newItemData = {
      list_item: {
        completed: false,
        refreshed: false,
      },
    };

    const [newItemResponse] = await Promise.all([
      axios.post(`/v2/lists/${listId}/list_items`, newItemData),
      axios.put(`/v2/lists/${listId}/list_items/${item.id}`, {
        list_item: { refreshed: true },
      }),
    ]);

    const newItemId = newItemResponse.data.id;

    // Step 2: Create each field individually using the same API pattern as normal item creation
    const fieldCreationPromises = item.fields.map((field) => {
      if (field.data && field.data.trim() !== '') {
        return axios.post(`/v2/lists/${listId}/list_items/${newItemId}/list_item_fields`, {
          list_item_field: {
            label: field.label,
            data: field.data,
            list_item_field_configuration_id: field.list_item_field_configuration_id,
          },
        });
      }
      return Promise.resolve(null);
    });

    // Wait for all fields to be created
    await Promise.all(fieldCreationPromises);

    // Step 3: Fetch the complete item with all its fields
    const { data: completeNewItem } = await axios.get(`/v2/lists/${listId}/list_items/${newItemId}`);

    // Defensive programming: ensure the item has proper field data
    const finalNewItem = {
      ...completeNewItem,
      fields:
        Array.isArray(completeNewItem.fields) && completeNewItem.fields.length > 0
          ? completeNewItem.fields
          : item.fields, // Fallback to original item fields if server response is incomplete
    };

    // Only update state if not skipping (for optimistic updates)
    if (!skipStateUpdate) {
      // Remove the old item from completed items
      setCompletedItems(completedItems.filter((completedItem) => completedItem.id !== item.id));

      // Add the complete new item to not completed items
      setNotCompletedItems(update(notCompletedItems, { $push: [finalNewItem] }));

      toastUtil.info('Item refreshed successfully.');
    }

    return finalNewItem;
  } catch (err) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'Failed to refresh item',
      navigate,
      redirectURI: '/lists',
    });
    throw err; // Re-throw the error so the caller can handle it
  } finally {
    setPending(false);
  }
}

// handleToggleRead
export async function handleToggleRead(params: {
  items: IListItem[];
  listId: string;
  completedItems: IListItem[];
  setCompletedItems: (v: IListItem[]) => void;
  notCompletedItems: IListItem[];
  setNotCompletedItems: (v: IListItem[]) => void;
  setSelectedItems: (v: IListItem[]) => void;
  setIncompleteMultiSelect: (v: boolean) => void;
  setCompleteMultiSelect: (v: boolean) => void;
  navigate?: (url: string) => void;
}): Promise<void> {
  const {
    items,
    listId,
    completedItems,
    setCompletedItems,
    notCompletedItems,
    setNotCompletedItems,
    setSelectedItems,
    setIncompleteMultiSelect,
    setCompleteMultiSelect,
    navigate,
  } = params;

  const updateRequests = items.map(async (item) => {
    const readField = item.fields.find((field) => field.label === 'read');
    const isRead = !(readField?.data === 'true');

    if (readField) {
      // Update existing field
      return axios.put(`/v2/lists/${listId}/list_items/${item.id}/list_item_fields/${readField.id}`, {
        list_item_field: {
          data: isRead.toString(),
          list_item_field_configuration_id: readField.list_item_field_configuration_id,
        },
      });
    } else {
      // Create new field - we need to get the field configuration first
      // Get the list to find its configuration ID
      const { data: list } = await axios.get(`/v2/lists/${listId}`);
      const fieldConfigurations = await getFieldConfigurations(list.list_item_configuration_id);
      const readConfig = fieldConfigurations.find((config) => config.label === 'read');
      /* istanbul ignore else */
      if (readConfig) {
        return axios.post(`/v2/lists/${listId}/list_items/${item.id}/list_item_fields`, {
          list_item_field: {
            data: isRead.toString(),
            list_item_field_configuration_id: readConfig.id,
          },
        });
      }
    }
  });

  try {
    await Promise.all(updateRequests);
    let newCompletedItems = completedItems;
    let newNotCompletedItems = notCompletedItems;

    items.forEach((item) => {
      const readField = item.fields.find((field) => field.label === 'read');
      if (readField) {
        readField.data = readField.data === 'true' ? 'false' : 'true';
        readField.updated_at = new Date().toISOString();
      } else {
        item.fields.push({
          id: `read-${item.id}`,
          list_item_field_configuration_id: 'read-config',
          data: 'true',
          archived_at: null,
          list_item_id: item.id,
          label: 'read',
          user_id: item.user_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          position: 0,
          data_type: EListItemFieldType.BOOLEAN,
        });
      }

      if (item.completed) {
        const itemIndex = newCompletedItems.findIndex((completedItem) => item.id === completedItem.id);
        const newItems = [...newCompletedItems];
        newItems[itemIndex] = { ...item, updated_at: new Date().toISOString() };
        newCompletedItems = newItems;
      } else {
        const itemIndex = newNotCompletedItems.findIndex((notCompletedItem) => item.id === notCompletedItem.id);
        const newItems = [...newNotCompletedItems];
        newItems[itemIndex] = { ...item, updated_at: new Date().toISOString() };
        newNotCompletedItems = newItems;
      }
    });

    setCompletedItems(newCompletedItems);
    setNotCompletedItems(newNotCompletedItems);
    setSelectedItems([]);
    setIncompleteMultiSelect(false);
    setCompleteMultiSelect(false);

    const pluralize = (items: IListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
    toastUtil.info(`${pluralize(items)} successfully updated.`);
  } catch (error) {
    handleFailure({
      error: error as AxiosError,
      notFoundMessage: 'Item not found',
      navigate,
      redirectURI: '/lists',
    });
  }
}
