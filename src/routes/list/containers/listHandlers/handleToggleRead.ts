import { showToast as toastUtil } from '../../../../utils/toast';
import type { AxiosError } from 'axios';
import axios from '../../../../utils/api';
import { EListItemFieldType, type IListItem } from 'typings';
import { handleFailure } from '../../../../utils/handleFailure';
import { getFieldConfigurations } from '../../../../utils/fieldConfigCache';

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
