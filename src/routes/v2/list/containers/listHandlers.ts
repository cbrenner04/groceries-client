import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import axios from '../../../../utils/api';
import update from 'immutability-helper';
import type { IV2ListItem } from 'typings';

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
    toast('Failed to add item', { type: 'error' });
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
  handleFailure: (error: AxiosError, msg: string) => void;
}): Promise<void> {
  const {
    item,
    listId,
    notCompletedItems,
    setNotCompletedItems,
    completedItems,
    setCompletedItems,
    setPending,
    handleFailure,
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
    handleFailure(err as AxiosError, 'Failed to complete item');
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
  handleFailure: (error: AxiosError, msg: string) => void;
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
    handleFailure,
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
    handleFailure(err as AxiosError, 'Failed to delete item');
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
  handleFailure: (error: AxiosError, msg: string) => void;
}): Promise<void> {
  const {
    item,
    listId,
    completedItems,
    setCompletedItems,
    notCompletedItems,
    setNotCompletedItems,
    setPending,
    handleFailure,
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
    handleFailure(err as AxiosError, 'Failed to refresh item');
  } finally {
    setPending(false);
  }
}
