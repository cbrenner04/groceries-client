import { showToast } from '../../../../utils/toast';
import { type AxiosError } from 'axios';
import { type IListItem } from 'typings';
import { handleFailure } from 'utils/handleFailure';

export interface IBulkOperationResult<T = void> {
  success: boolean;
  item: IListItem;
  error?: unknown;
  result?: T;
}

export interface IBulkOperationCallbacks<T = void> {
  executeOperation: (item: IListItem) => Promise<T>;
  successMessage: (items: IListItem[]) => string;
  failureMessage: (successful: IListItem[], failed: IListItem[]) => string;
  allFailureMessage: string;
  allFailureToastMessage?: string; // If provided, use showToast.error instead of handleFailure
  navigate?: (url: string) => void;
}

export async function executeBulkOperations<T = void>(
  itemsToProcess: IListItem[],
  callbacks: IBulkOperationCallbacks<T>,
): Promise<IBulkOperationResult<T>[]> {
  const apiPromises = itemsToProcess.map(async (item) => {
    try {
      const result = await callbacks.executeOperation(item);
      return { success: true, item, result } as IBulkOperationResult<T>;
    } catch (error) {
      return { success: false, item, error } as IBulkOperationResult<T>;
    }
  });

  const results = await Promise.all(apiPromises);

  const failures: IListItem[] = [];
  const successfulItems: IListItem[] = [];

  results.forEach((result) => {
    if (result.success) {
      successfulItems.push(result.item);
    } else {
      failures.push(result.item);
    }
  });

  // Handle failures
  if (failures.length > 0) {
    if (successfulItems.length > 0) {
      showToast.warning(callbacks.failureMessage(successfulItems, failures));
    } else {
      if (callbacks.allFailureToastMessage) {
        showToast.error(callbacks.allFailureToastMessage);
      } else {
        handleFailure({
          error: new Error(callbacks.allFailureMessage) as AxiosError,
          notFoundMessage: callbacks.allFailureMessage,
          navigate: callbacks.navigate,
        });
      }
    }
  } else {
    // All succeeded
    showToast.info(callbacks.successMessage(itemsToProcess));
  }

  return results;
}

export function pluralize(items: IListItem[]): string {
  return items.length > 1 ? 'Items' : 'Item';
}

export function extractCategoriesFromItems(items: IListItem[]): string[] {
  const categories = new Set<string>();
  items.forEach((item) => {
    const categoryField = item.fields.find((field) => field.label === 'category');
    if (categoryField?.data) {
      categories.add(String(categoryField.data));
    }
  });
  return Array.from(categories);
}
