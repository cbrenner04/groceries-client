import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Bookmark, Refresh, EditButton, Trash } from '../../../../components/ActionButtons';

const PurchasedItemButtons = (props) => (
  <ButtonGroup className="float-right">
    {['GroceryList', 'SimpleList', 'ToDoList'].includes(props.listType) && (
      <Refresh
        handleClick={() => props.handleItemRefresh(props.item)}
        testID={`purchased-item-refresh-${props.item.id}`}
      />
    )}
    {props.listType === 'BookList' && (
      <Bookmark
        handleClick={() => props.toggleItemRead(props.item)}
        read={props.item.read}
        testID={`purchased-item-${props.item.read ? 'unread' : 'read'}-${props.item.id}`}
      />
    )}
    <EditButton
      handleClick={() => props.handleItemEdit(props.item)}
      testID={`purchased-item-edit-${props.item.id}`}
      disabled={!props.multiSelect || props.selectedItems.length === 0}
    />
    <Trash
      handleClick={() => props.handleItemDelete(props.item)}
      testID={`purchased-item-delete-${props.item.id}`}
      disabled={false}
    />
  </ButtonGroup>
);

PurchasedItemButtons.propTypes = {
  listType: PropTypes.string.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    read: PropTypes.bool,
    completed: PropTypes.bool,
    purchased: PropTypes.bool,
  }).isRequired,
  handleItemRefresh: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  toggleItemRead: PropTypes.func.isRequired,
  handleItemEdit: PropTypes.func.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      product: PropTypes.string,
      task: PropTypes.string,
      content: PropTypes.string,
      quantity: PropTypes.string,
      author: PropTypes.string,
      title: PropTypes.string,
      artist: PropTypes.string,
      album: PropTypes.string,
      assignee_id: PropTypes.number,
      due_by: PropTypes.string,
      read: PropTypes.bool,
      number_in_series: PropTypes.number,
      category: PropTypes.string,
      completed: PropTypes.bool,
      purchased: PropTypes.bool,
    }),
  ).isRequired,
};

export default PurchasedItemButtons;
