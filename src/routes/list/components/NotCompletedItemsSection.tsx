import React, { useCallback, type ReactNode } from 'react';
import { ListGroup } from 'react-bootstrap';

import type { IListItem } from 'typings';
import { EUserPermissions } from 'typings';
import { capitalize, normalizeCategoryKey } from 'utils/format';

import ListItem from './ListItem';
import MultiSelectMenu from './MultiSelectMenu';

export interface INotCompletedItemsSectionProps {
  notCompletedItems: IListItem[];
  permissions: EUserPermissions;
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
          const itemCategory = item.category ? String(item.category).trimEnd() : '';

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
        return (
          <React.Fragment key={`${category ?? 'uncategorized'}-wrapper`}>
            {category && <h5 data-test-class="category-header">{capitalize(category)}</h5>}
            <ListGroup className="mb-3" key={category ?? 'uncategorized'}>
              {itemsToRender.map((item: IListItem) => (
                <ListItem
                  key={item.id}
                  item={item}
                  permissions={props.permissions}
                  selectedItems={props.selectedItems}
                  pending={props.pending}
                  handleItemSelect={props.handleItemSelect}
                  handleItemComplete={props.handleItemComplete}
                  handleItemEdit={props.handleItemEdit}
                  handleItemDelete={props.handleItemDelete}
                  handleItemRefresh={props.handleItemRefresh}
                  multiSelect={props.incompleteMultiSelect}
                />
              ))}
            </ListGroup>
          </React.Fragment>
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

  return (
    <React.Fragment>
      {props.permissions === EUserPermissions.WRITE && (
        <MultiSelectMenu
          setCopy={props.setCopy}
          setMove={props.setMove}
          isMultiSelect={props.incompleteMultiSelect}
          selectedItems={props.selectedItems}
          setSelectedItems={props.setSelectedItems}
          setMultiSelect={props.setIncompleteMultiSelect}
        />
      )}
      <br />
      {groupByCategory(props.notCompletedItems)}
    </React.Fragment>
  );
};

export default React.memo(NotCompletedItemsSection);
