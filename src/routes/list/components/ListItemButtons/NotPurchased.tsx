import React from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { Bookmark, Complete, EditButton, Trash } from '../../../../components/ActionButtons';
import { IListItem } from '../../../../typings';

interface INotPurchasedItemButtonsProps {
  listType: string;
  item: IListItem;
  handlePurchaseOfItem: (item: IListItem) => void;
  handleItemDelete: (item: IListItem) => void;
  toggleItemRead: (item: IListItem) => void;
  handleItemEdit: (item: IListItem) => void;
  pending: boolean;
  multiSelect?: boolean;
}

const NotPurchasedItemButtons: React.FC<INotPurchasedItemButtonsProps> = (props) => {
  return (
    <ButtonGroup className={`${props.multiSelect ? 'list-item-buttons' : ''} float-end`}>
      {props.listType === 'BookList' && (
        <Bookmark
          handleClick={() => props.toggleItemRead(props.item)}
          read={props.item.read ?? false}
          testID={`not-purchased-item-${props.item.read ? 'unread' : 'read'}-${props.item.id}`}
        />
      )}
      <Complete
        handleClick={() => props.handlePurchaseOfItem(props.item)}
        testID={`not-purchased-item-complete-${props.item.id}`}
        disabled={props.pending}
      />
      <EditButton
        handleClick={() => props.handleItemEdit(props.item)}
        testID={`not-purchased-item-edit-${props.item.id}`}
        disabled={props.pending}
      />
      <Trash
        handleClick={() => props.handleItemDelete(props.item)}
        testID={`not-purchased-item-delete-${props.item.id}`}
        disabled={props.pending}
      />
    </ButtonGroup>
  );
};

export default NotPurchasedItemButtons;
