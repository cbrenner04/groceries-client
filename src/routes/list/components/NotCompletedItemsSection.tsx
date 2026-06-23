import React, { useCallback, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import type {
  EUserPermissions,
  IListItem,
  IListItemField,
  IListItemFieldConfiguration,
  TUserPermissions,
} from 'typings';
import { normalizeCategoryKey } from 'utils/format';
import { ListItemRow, type TListItemAnimationState } from 'components/domain/ListItemRow';
import { CategoryGroup } from 'components/domain/CategoryGroup';
import { EmptyState } from 'components/domain/EmptyState';

export interface INotCompletedItemsSectionProps {
  notCompletedItems: IListItem[];
  permissions: EUserPermissions;
  permissionsDict?: TUserPermissions;
  selectedItems: IListItem[];
  pending: boolean;
  filter: string;
  displayedCategories: string[];
  listItemFieldConfigurations: IListItemFieldConfiguration[];
  incompleteMultiSelect: boolean;
  itemAnimationStates?: Record<string, TListItemAnimationState>;
  sessionMode?: 'building' | 'shopping' | 'neutral';
  setSelectedItems: (items: IListItem[]) => void;
  handleItemSelect: (item: IListItem) => void;
  handleItemComplete: (item: IListItem) => Promise<void>;
  handleItemEdit: (item: IListItem) => void;
  handleItemDelete: (item: IListItem) => void;
  handleItemRefresh: (item: IListItem) => Promise<void>;
}

const NotCompletedItemsSection: React.FC<INotCompletedItemsSectionProps> = (props): React.JSX.Element => {
  const isTestEnvironment = import.meta.env.VITEST === 'true';
  const isAnimationDisabled = isTestEnvironment || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
            {isAnimationDisabled ? (
              itemsToRender.map((item: IListItem, index: number) => {
                const findItem = (itemId: string): IListItem => items.find((i) => i.id === itemId) as IListItem;
                return (
                  <ListItemRow
                    key={item.id}
                    item={item}
                    listId={item.list_id}
                    fields={(item.fields ?? []) as IListItemField[]}
                    fieldConfigurations={props.listItemFieldConfigurations}
                    isMultiSelectActive={props.incompleteMultiSelect}
                    isSelected={props.selectedItems.some((selected) => selected.id === item.id)}
                    onSelect={(itemId) => props.handleItemSelect(findItem(itemId))}
                    onComplete={(itemId) => props.handleItemComplete(findItem(itemId))}
                    onRefresh={(itemId) => props.handleItemRefresh(findItem(itemId))}
                    onEdit={(itemId) => props.handleItemEdit(findItem(itemId))}
                    onDelete={(itemId) => props.handleItemDelete(findItem(itemId))}
                    permissions={props.permissionsDict ?? {}}
                    itemAnimationState={props.itemAnimationStates?.[item.id] ?? 'none'}
                    animationIndex={index}
                  />
                );
              })
            ) : (
              <AnimatePresence mode="popLayout">
                {itemsToRender.map((item: IListItem, index: number) => {
                  const findItem = (itemId: string): IListItem => items.find((i) => i.id === itemId) as IListItem;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -56, scale: 0.98 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                    >
                      <ListItemRow
                        item={item}
                        listId={item.list_id}
                        fields={(item.fields ?? []) as IListItemField[]}
                        fieldConfigurations={props.listItemFieldConfigurations}
                        isMultiSelectActive={props.incompleteMultiSelect}
                        isSelected={props.selectedItems.some((selected) => selected.id === item.id)}
                        onSelect={(itemId) => props.handleItemSelect(findItem(itemId))}
                        onComplete={(itemId) => props.handleItemComplete(findItem(itemId))}
                        onRefresh={(itemId) => props.handleItemRefresh(findItem(itemId))}
                        onEdit={(itemId) => props.handleItemEdit(findItem(itemId))}
                        onDelete={(itemId) => props.handleItemDelete(findItem(itemId))}
                        permissions={props.permissionsDict ?? {}}
                        itemAnimationState={props.itemAnimationStates?.[item.id] ?? 'none'}
                        animationIndex={index}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </CategoryGroup>
        );
      });
    },
    [
      props.filter,
      props.displayedCategories,
      props.listItemFieldConfigurations,
      props.itemAnimationStates,
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

  if (props.notCompletedItems.length === 0) {
    return (
      <div className="tw:mt-4 tw:mb-4">
        <EmptyState
          title="No items yet"
          description="Items appear here after you add them"
          testId="not-completed-empty-state"
        />
      </div>
    );
  }

  return <React.Fragment>{groupByCategory(props.notCompletedItems)}</React.Fragment>;
};

export default React.memo(NotCompletedItemsSection);
