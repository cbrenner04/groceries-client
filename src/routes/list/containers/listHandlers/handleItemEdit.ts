import { type IListItem } from 'typings';

export function handleItemEdit(params: { item: IListItem; listId: string; navigate: (url: string) => void }): void {
  const { item, listId, navigate } = params;
  navigate(`/lists/${listId}/list_items/${item.id}/edit`);
}
