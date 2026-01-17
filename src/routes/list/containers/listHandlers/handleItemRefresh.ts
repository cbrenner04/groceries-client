import { showToast as toastUtil } from '../../../../utils/toast';
import type { AxiosError } from 'axios';
import axios from '../../../../utils/api';
import update from 'immutability-helper';
import { type IListItem } from 'typings';
import { handleFailure } from '../../../../utils/handleFailure';

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
