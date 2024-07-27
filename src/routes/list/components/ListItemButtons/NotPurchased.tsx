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

const NotPurchasedItemButtons: React.FC<INotPurchasedItemButtonsProps> = ({
  listType,
  item,
  handlePurchaseOfItem,
  handleItemDelete,
  handleItemEdit,
  toggleItemRead,
  pending,
  multiSelect = false,
}): React.JSX.Element => {
  return (
    <ButtonGroup className={`${multiSelect ? 'list-item-buttons' : ''} float-end`}>
      {listType === 'BookList' && (
        <Bookmark
          handleClick={(): void => toggleItemRead(item)}
          read={item.read ?? false}
          testID={`not-purchased-item-${item.read ? 'unread' : 'read'}-${item.id}`}
        />
      )}
      <Complete
        handleClick={(): void => handlePurchaseOfItem(item)}
        testID={`not-purchased-item-complete-${item.id}`}
        disabled={pending}
      />
      <EditButton
        handleClick={(): void => handleItemEdit(item)}
        testID={`not-purchased-item-edit-${item.id}`}
        disabled={pending}
      />
      <Trash
        handleClick={(): void => handleItemDelete(item)}
        testID={`not-purchased-item-delete-${item.id}`}
        disabled={pending}
      />
    </ButtonGroup>
  );
};

export default NotPurchasedItemButtons;
