import React from 'react';

import NotPurchased from './NotPurchased';
import Purchased from './Purchased';
import type { IListItem, EListType } from '../../../../typings';

export interface IListItemButtonsProps {
  item: IListItem;
  purchased: boolean;
  handleItemDelete: (item: IListItem) => void;
  handlePurchaseOfItem: (item: IListItem) => void;
  handleItemRefresh: (item: IListItem) => void;
  listType: EListType;
  toggleItemRead: (item: IListItem) => void;
  handleItemEdit: (item: IListItem) => void;
  multiSelect: boolean;
  selectedItems: IListItem[];
  pending: boolean;
}

const ListItemButtons: React.FC<IListItemButtonsProps> = (props): React.JSX.Element =>
  props.purchased ? (
    <Purchased
      listType={props.listType}
      item={props.item}
      handleItemRefresh={props.handleItemRefresh}
      handleItemDelete={props.handleItemDelete}
      toggleItemRead={props.toggleItemRead}
      handleItemEdit={props.handleItemEdit}
      multiSelect={props.multiSelect}
      selectedItems={props.selectedItems}
      pending={props.pending}
    />
  ) : (
    <NotPurchased
      listType={props.listType}
      item={props.item}
      handlePurchaseOfItem={props.handlePurchaseOfItem}
      handleItemDelete={props.handleItemDelete}
      toggleItemRead={props.toggleItemRead}
      handleItemEdit={props.handleItemEdit}
      pending={props.pending}
      multiSelect={props.multiSelect}
    />
  );

export default ListItemButtons;
