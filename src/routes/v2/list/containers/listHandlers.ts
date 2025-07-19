import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import axios from '../../../../utils/api';
import update from 'immutability-helper';
import type { IV2ListItem } from 'typings';
import { handleFailure } from '../../../../utils/handleFailure';

// handleAddItem
export function handleAddItem(params: {
  newItems: IV2ListItem[];
  pending: boolean;
  setPending: (v: boolean) => void;
  completedItems: IV2ListItem[];
  setCompletedItems: (v: IV2ListItem[]) => void;
  notCompletedItems: IV2ListItem[];
  setNotCompletedItems: (v: IV2ListItem[]) => void;
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
      setCompletedItems(update(completedItems, { $push: [itemWithFields] }));
    } else {
      setNotCompletedItems(update(notCompletedItems, { $push: [itemWithFields] }));
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
    toast('Item successfully added.', { type: 'info' });
  } catch (err) {
    handleFailure({ error: err as AxiosError, notFoundMessage: 'Failed to add item', navigate, redirectURI: '/lists' });
  } finally {
    setPending(false);
  }
}

// handleItemSelect
export function handleItemSelect(params: {
  item: IV2ListItem;
  selectedItems: IV2ListItem[];
  setSelectedItems: (v: IV2ListItem[]) => void;
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
export function handleItemEdit(params: { item: IV2ListItem; listId: string; navigate: (url: string) => void }): void {
  const { item, listId, navigate } = params;
  navigate(`/v2/lists/${listId}/list_items/${item.id}/edit`);
}

// handleItemComplete
export async function handleItemComplete(params: {
  item: IV2ListItem;
  listId: string;
  notCompletedItems: IV2ListItem[];
  setNotCompletedItems: (v: IV2ListItem[]) => void;
  completedItems: IV2ListItem[];
  setCompletedItems: (v: IV2ListItem[]) => void;
  setPending: (v: boolean) => void;
  navigate?: (url: string) => void;
}): Promise<void> {
  const {
    item,
    listId,
    notCompletedItems,
    setNotCompletedItems,
    completedItems,
    setCompletedItems,
    setPending,
    navigate,
  } = params;
  setPending(true);
  try {
    const { data } = await axios.put(`/v2/lists/${listId}/list_items/${item.id}`, {
      list_item: { completed: true },
    });
    setNotCompletedItems(notCompletedItems.filter((notCompletedItem) => notCompletedItem.id !== item.id));
    // Preserve original fields if API response doesn't include them
    const completedItem = {
      ...data,
      fields: Array.isArray(data.fields) && data.fields.length > 0 ? data.fields : item.fields,
    };
    setCompletedItems(update(completedItems, { $push: [completedItem] }));
    toast('Item marked as completed.', { type: 'info' });
  } catch (err) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'Failed to complete item',
      navigate,
      redirectURI: '/lists',
    });
  } finally {
    setPending(false);
  }
}

// handleItemDelete
export async function handleItemDelete(params: {
  item: IV2ListItem;
  listId: string;
  completedItems: IV2ListItem[];
  setCompletedItems: (v: IV2ListItem[]) => void;
  notCompletedItems: IV2ListItem[];
  setNotCompletedItems: (v: IV2ListItem[]) => void;
  selectedItems: IV2ListItem[];
  setSelectedItems: (v: IV2ListItem[]) => void;
  setPending: (v: boolean) => void;
  navigate?: (url: string) => void;
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
  } = params;
  setPending(true);
  try {
    await axios.delete(`/v2/lists/${listId}/list_items/${item.id}`);
    if (item.completed) {
      setCompletedItems(completedItems.filter((completedItem) => completedItem.id !== item.id));
    } else {
      setNotCompletedItems(notCompletedItems.filter((notCompletedItem) => notCompletedItem.id !== item.id));
    }
    setSelectedItems(selectedItems.filter((selectedItem) => selectedItem.id !== item.id));
    toast('Item deleted successfully.', { type: 'info' });
  } catch (err) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'Failed to delete item',
      navigate,
      redirectURI: '/lists',
    });
  } finally {
    setPending(false);
  }
}

// handleItemRefresh
export async function handleItemRefresh(params: {
  item: IV2ListItem;
  listId: string;
  completedItems: IV2ListItem[];
  setCompletedItems: (v: IV2ListItem[]) => void;
  notCompletedItems: IV2ListItem[];
  setNotCompletedItems: (v: IV2ListItem[]) => void;
  setPending: (v: boolean) => void;
  navigate?: (url: string) => void;
}): Promise<void> {
  const {
    item,
    listId,
    completedItems,
    setCompletedItems,
    notCompletedItems,
    setNotCompletedItems,
    setPending,
    navigate,
  } = params;
  setPending(true);
  try {
    // Create a new item with the same data but completed: false
    const newItemData = {
      list_item: {
        completed: false,
        refreshed: false,
        fields: item.fields.map((field) => ({
          list_item_field_configuration_id: field.list_item_field_configuration_id,
          data: field.data,
          label: field.label,
        })),
      },
    };

    const [newItemResponse] = await Promise.all([
      axios.post(`/v2/lists/${listId}/list_items`, newItemData),
      axios.put(`/v2/lists/${listId}/list_items/${item.id}`, {
        list_item: { refreshed: true },
      }),
    ]);

    // Remove the old item from completed items
    setCompletedItems(completedItems.filter((completedItem) => completedItem.id !== item.id));

    // Add the new item to not completed items
    const newItem = {
      ...newItemResponse.data,
      fields:
        Array.isArray(newItemResponse.data.fields) && newItemResponse.data.fields.length > 0
          ? newItemResponse.data.fields
          : item.fields,
    };
    setNotCompletedItems(update(notCompletedItems, { $push: [newItem] }));

    toast('Item refreshed successfully.', { type: 'info' });
  } catch (err) {
    handleFailure({
      error: err as AxiosError,
      notFoundMessage: 'Failed to refresh item',
      navigate,
      redirectURI: '/lists',
    });
  } finally {
    setPending(false);
  }
}

// handleToggleRead
export async function handleToggleRead(params: {
  items: IV2ListItem[];
  listId: string;
  completedItems: IV2ListItem[];
  setCompletedItems: (v: IV2ListItem[]) => void;
  notCompletedItems: IV2ListItem[];
  setNotCompletedItems: (v: IV2ListItem[]) => void;
  setSelectedItems: (v: IV2ListItem[]) => void;
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

  const updateRequests = items.map((item) => {
    const readField = item.fields.find((field) => field.label === 'read');
    const isRead = !(readField?.data === 'true');
    return axios.put(`/v2/lists/${listId}/list_items/${item.id}`, {
      list_item: {
        fields: [
          {
            label: 'read',
            data: isRead.toString(),
          },
        ],
      },
    });
  });

  try {
    await Promise.all(updateRequests);
    let newCompletedItems = completedItems;
    let newNotCompletedItems = notCompletedItems;

    items.forEach((item) => {
      const readField = item.fields.find((field) => field.label === 'read');
      if (readField) {
        readField.data = readField.data === 'true' ? 'false' : 'true';
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
          data_type: 'boolean',
        });
      }

      if (item.completed) {
        const itemIndex = newCompletedItems.findIndex((completedItem) => item.id === completedItem.id);
        const newItems = [...newCompletedItems];
        newItems[itemIndex] = item;
        newCompletedItems = newItems;
      } else {
        const itemIndex = newNotCompletedItems.findIndex((notCompletedItem) => item.id === notCompletedItem.id);
        const newItems = [...newNotCompletedItems];
        newItems[itemIndex] = item;
        newNotCompletedItems = newItems;
      }
    });

    setCompletedItems(newCompletedItems);
    setNotCompletedItems(newNotCompletedItems);
    setSelectedItems([]);
    setIncompleteMultiSelect(false);
    setCompleteMultiSelect(false);

    const pluralize = (items: IV2ListItem[]): string => (items.length > 1 ? 'Items' : 'Item');
    toast(`${pluralize(items)} successfully updated.`, { type: 'info' });
  } catch (error) {
    handleFailure({
      error: error as AxiosError,
      notFoundMessage: 'Item not found',
      navigate,
      redirectURI: '/lists',
    });
  }
}
