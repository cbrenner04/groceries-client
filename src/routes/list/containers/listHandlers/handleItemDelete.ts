import { showToast as toastUtil } from '../../../../utils/toast';
import type { AxiosError } from 'axios';
import axios from '../../../../utils/api';
import { type IListItem } from 'typings';
import { handleFailure } from '../../../../utils/handleFailure';

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
