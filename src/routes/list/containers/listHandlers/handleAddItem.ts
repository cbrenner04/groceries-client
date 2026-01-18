import { showToast as toastUtil } from '../../../../utils/toast';
import type { AxiosError } from 'axios';
import { type IListItem } from 'typings';
import { handleFailure } from '../../../../utils/handleFailure';
import { sortItemsByCreatedAt } from './sortItemsByCreatedAt';
import { normalizeCategoryKey } from '../../../../utils/format';

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
    const normalizedCategory = itemCategory?.trimEnd();
    const categoryExists =
      normalizedCategory !== undefined
        ? categories.some((category) => normalizeCategoryKey(category) === normalizeCategoryKey(normalizedCategory))
        : false;
    if (itemWithFields.completed) {
      const updatedCompletedItems = sortItemsByCreatedAt([...completedItems, itemWithFields]);
      setCompletedItems(updatedCompletedItems);
    } else {
      const updatedNotCompletedItems = sortItemsByCreatedAt([...notCompletedItems, itemWithFields]);
      setNotCompletedItems(updatedNotCompletedItems);
    }
    if (normalizedCategory && !categoryExists) {
      const newCategories = [...categories, normalizedCategory];
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
