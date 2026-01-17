import type { AxiosError } from 'axios';
import axios from '../../../../utils/api';
import { type IListItem } from 'typings';
import { handleFailure } from '../../../../utils/handleFailure';

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
