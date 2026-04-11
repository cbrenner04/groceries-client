import React, { useCallback, type ReactNode } from 'react';

import type { EUserPermissions, IListItem, IListItemField, TUserPermissions } from 'typings';
import { normalizeCategoryKey } from 'utils/format';
import { ListItemRow } from 'components/domain/ListItemRow';
import { CategoryGroup } from 'components/domain/CategoryGroup';

export interface INotCompletedItemsSectionProps {
  notCompletedItems: IListItem[];
  permissions: EUserPermissions;
  permissionsDict?: TUserPermissions;
  selectedItems: IListItem[];
  pending: boolean;
  filter: string;
  displayedCategories: string[];
  incompleteMultiSelect: boolean;
  setCopy: (value: boolean) => void;
  setMove: (value: boolean) => void;
  setSelectedItems: (items: IListItem[]) => void;
  setIncompleteMultiSelect: (value: boolean) => void;
  handleItemSelect: (item: IListItem) => void;
  handleItemComplete: (item: IListItem) => Promise<void>;
  handleItemEdit: (item: IListItem) => void;
  handleItemDelete: (item: IListItem) => void;
  handleItemRefresh: (item: IListItem) => Promise<void>;
}

const NotCompletedItemsSection: React.FC<INotCompletedItemsSectionProps> = (props): React.JSX.Element => {
  const groupByCategory = useCallback(
    (items: IListItem[]): ReactNode => {
      // Extract all unique categories from the items (case-insensitive)
      const itemCategories = new Set<string>();
      items.forEach((item) => {
        const rawCategory = item.category;
        if (rawCategory) {
          const normalizedCategory = String(rawCategory).trim();
          if (normalizedCategory === '') {
            return;
          }
          const normalizedKey = normalizeCategoryKey(normalizedCategory);
          const existing = Array.from(itemCategories).find((cat) => normalizeCategoryKey(cat) === normalizedKey);
          if (!existing) {
            itemCategories.add(normalizedCategory);
          }
        }
      });

      // When a filter is applied, show only the selected category
      // When no filter is applied, show all categories plus uncategorized items
      const categoriesToShow = props.filter ? props.displayedCategories : [undefined, ...Array.from(itemCategories)];

      return categoriesToShow.map((category: string | undefined) => {
        const itemsToRender = items.filter((item: IListItem) => {
          const itemCategory = item.category ? String(item.category).trim() : '';

          if (category === 'uncategorized') {
            return !itemCategory;
          }

          if (category) {
            return itemCategory && normalizeCategoryKey(itemCategory) === normalizeCategoryKey(category);
          }

          // Show uncategorized items when no filter is applied
          return !itemCategory;
        });

        if (itemsToRender.length === 0) {
          return null;
        }

        const displayCategory = !category ? '' : category;

        return (
          <CategoryGroup
            key={displayCategory || 'uncategorized'}
            category={displayCategory}
            itemCount={itemsToRender.length}
          >
            {itemsToRender.map((item: IListItem) => (
              <ListItemRow
                key={item.id}
                item={item}
                listId={item.list_id}
                fields={(item.fields ?? []) as IListItemField[]}
                fieldConfigurations={[]}
                isMultiSelectActive={props.incompleteMultiSelect}
                isSelected={props.selectedItems.some((selected) => selected.id === item.id)}
                onSelect={(itemId: string) => {
                  const selectedItem = items.find((i) => i.id === itemId);
                  if (selectedItem) {
                    props.handleItemSelect(selectedItem);
                  }
                }}
                onComplete={(itemId: string) => {
                  const itemToComplete = items.find((i) => i.id === itemId);
                  if (itemToComplete) {
                    props.handleItemComplete(itemToComplete);
                  }
                }}
                onRefresh={(itemId: string) => {
                  const itemToRefresh = items.find((i) => i.id === itemId);
                  if (itemToRefresh) {
                    props.handleItemRefresh(itemToRefresh);
                  }
                }}
                onEdit={(itemId: string) => {
                  const itemToEdit = items.find((i) => i.id === itemId);
                  if (itemToEdit) {
                    props.handleItemEdit(itemToEdit);
                  }
                }}
                onDelete={(itemId: string) => {
                  const itemToDelete = items.find((i) => i.id === itemId);
                  if (itemToDelete) {
                    props.handleItemDelete(itemToDelete);
                  }
                }}
                permissions={props.permissionsDict ?? {}}
              />
            ))}
          </CategoryGroup>
        );
      });
    },
    [
      props.filter,
      props.displayedCategories,
      props.permissions,
      props.selectedItems,
      props.pending,
      props.handleItemSelect,
      props.handleItemComplete,
      props.handleItemEdit,
      props.handleItemDelete,
      props.handleItemRefresh,
      props.incompleteMultiSelect,
    ],
  );

  return <React.Fragment>{groupByCategory(props.notCompletedItems)}</React.Fragment>;
};

export default React.memo(NotCompletedItemsSection);
