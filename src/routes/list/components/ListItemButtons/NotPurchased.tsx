import React from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { Bookmark, Complete, EditButton, Trash } from 'components/ActionButtons';
import type { IListItem } from 'typings';

export interface INotPurchasedItemButtonsProps {
  listType: string;
  item: IListItem;
  handlePurchaseOfItem: (item: IListItem) => void;
  handleItemDelete: (item: IListItem) => void;
  toggleItemRead: (item: IListItem) => void;
  handleItemEdit: (item: IListItem) => void;
  pending: boolean;
  multiSelect?: boolean;
}

const NotPurchasedItemButtons: React.FC<INotPurchasedItemButtonsProps> = (props): React.JSX.Element => (
  <ButtonGroup className={`${props.multiSelect ? 'list-item-buttons' : ''} float-end`}>
    {props.listType === 'BookList' && (
      <Bookmark
        handleClick={(): void => props.toggleItemRead(props.item)}
        read={props.item.read ?? false}
        testID={`not-purchased-item-${props.item.read ? 'unread' : 'read'}-${props.item.id}`}
      />
    )}
    <Complete
      handleClick={(): void => props.handlePurchaseOfItem(props.item)}
      testID={`not-purchased-item-complete-${props.item.id}`}
      disabled={props.pending}
    />
    <EditButton
      handleClick={(): void => props.handleItemEdit(props.item)}
      testID={`not-purchased-item-edit-${props.item.id}`}
      disabled={props.pending}
    />
    <Trash
      handleClick={(): void => props.handleItemDelete(props.item)}
      testID={`not-purchased-item-delete-${props.item.id}`}
      disabled={props.pending}
    />
  </ButtonGroup>
);

export default NotPurchasedItemButtons;
