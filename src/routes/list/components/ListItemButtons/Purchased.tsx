import React from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { Bookmark, Refresh, EditButton, Trash } from '../../../../components/ActionButtons';
import { IListItem } from '../../../../typings';

interface IPurchasedItemButtonsProps {
  listType: string;
  item: IListItem;
  handleItemRefresh: (item: IListItem) => void;
  handleItemDelete: (item: IListItem) => void;
  toggleItemRead: (item: IListItem) => void;
  handleItemEdit: (item: IListItem) => void;
  multiSelect: boolean;
  selectedItems: IListItem[];
  pending: boolean;
}

const PurchasedItemButtons: React.FC<IPurchasedItemButtonsProps> = (props) => (
  <ButtonGroup className={`${props.multiSelect ? 'list-item-buttons' : ''} float-end`}>
    {['GroceryList', 'SimpleList', 'ToDoList'].includes(props.listType) && (
      <Refresh
        handleClick={() => props.handleItemRefresh(props.item)}
        testID={`purchased-item-refresh-${props.item.id}`}
        disabled={props.pending}
      />
    )}
    {props.listType === 'BookList' && (
      <Bookmark
        handleClick={() => props.toggleItemRead(props.item)}
        read={props.item.read ?? false}
        testID={`purchased-item-${props.item.read ? 'unread' : 'read'}-${props.item.id}`}
      />
    )}
    <EditButton
      handleClick={() => props.handleItemEdit(props.item)}
      testID={`purchased-item-edit-${props.item.id}`}
      disabled={!props.multiSelect || props.selectedItems.length === 0 || props.pending}
    />
    <Trash
      handleClick={() => props.handleItemDelete(props.item)}
      testID={`purchased-item-delete-${props.item.id}`}
      disabled={props.pending}
    />
  </ButtonGroup>
);

export default PurchasedItemButtons;
