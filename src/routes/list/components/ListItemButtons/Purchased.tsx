import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Bookmark, Refresh, EditButton, Trash } from '../../../../components/ActionButtons';
import { listItem } from '../../../../types';

const PurchasedItemButtons = (props) => (
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
        read={props.item.read}
        testID={`purchased-item-${props.item.read ? 'unread' : 'read'}-${props.item.id}`}
        disabled={props.pending}
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

PurchasedItemButtons.propTypes = {
  listType: PropTypes.string.isRequired,
  item: listItem.isRequired,
  handleItemRefresh: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  toggleItemRead: PropTypes.func.isRequired,
  handleItemEdit: PropTypes.func.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedItems: PropTypes.arrayOf(listItem).isRequired,
  pending: PropTypes.bool.isRequired,
};

export default PurchasedItemButtons;
