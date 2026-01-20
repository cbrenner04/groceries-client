import React from 'react';
import { ListGroup } from 'react-bootstrap';

import type { IListItem } from 'typings';
import { EUserPermissions } from 'typings';

import ListItem from './ListItem';
import MultiSelectMenu from './MultiSelectMenu';

export interface ICompletedItemsSectionProps {
  completedItems: IListItem[];
  permissions: EUserPermissions;
  selectedItems: IListItem[];
  pending: boolean;
  completeMultiSelect: boolean;
  setCopy: (value: boolean) => void;
  setMove: (value: boolean) => void;
  setSelectedItems: (items: IListItem[]) => void;
  setCompleteMultiSelect: (value: boolean) => void;
  handleItemSelect: (item: IListItem) => void;
  handleItemComplete: (item: IListItem) => Promise<void>;
  handleItemEdit: (item: IListItem) => void;
  handleItemDelete: (item: IListItem) => void;
  handleItemRefresh: (item: IListItem) => Promise<void>;
  toggleItemRead?: (item: IListItem) => Promise<void>;
}

const CompletedItemsSection: React.FC<ICompletedItemsSectionProps> = (props): React.JSX.Element => {
  return (
    <React.Fragment>
      <h2>Completed Items</h2>
      {props.permissions === EUserPermissions.WRITE && (
        <MultiSelectMenu
          setCopy={props.setCopy}
          setMove={props.setMove}
          isMultiSelect={props.completeMultiSelect}
          selectedItems={props.selectedItems}
          setSelectedItems={props.setSelectedItems}
          setMultiSelect={props.setCompleteMultiSelect}
        />
      )}
      <ListGroup className="mb-3">
        {props.completedItems.map((item: IListItem) => (
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
            toggleItemRead={props.toggleItemRead}
            multiSelect={props.completeMultiSelect}
          />
        ))}
      </ListGroup>
    </React.Fragment>
  );
};

export default React.memo(CompletedItemsSection);
