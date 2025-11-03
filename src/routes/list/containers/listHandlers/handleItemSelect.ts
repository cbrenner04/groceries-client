import update from 'immutability-helper';
import { type IListItem } from 'typings';

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
