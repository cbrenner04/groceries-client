import type { IListItem } from 'typings';

// Sort items by created_at in ascending order to match server ordering
export const sortItemsByCreatedAt = (items: IListItem[]): IListItem[] => {
  if (items.length <= 1) {
    return items.length === 0 ? [] : [...items];
  }

  return [...items].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateA - dateB;
  });
};
