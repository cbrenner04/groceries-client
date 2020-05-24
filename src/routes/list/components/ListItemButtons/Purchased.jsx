import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Bookmark, Refresh, Trash } from '../../../../components/ActionButtons';

function PurchasedItemButtons(props) {
  const handleRead = () => props.handleReadOfItem(props.item);
  const handleUnRead = () => props.handleUnReadOfItem(props.item);
  return (
    <ButtonGroup className="float-right">
      {(props.listType === 'GroceryList' || props.listType === 'ToDoList') && (
        <Refresh
          handleClick={() => props.handleItemUnPurchase(props.item)}
          data-test-id={`purchased-item-refresh-${props.item.id}`}
        />
      )}
      {props.listType === 'BookList' && (
        <Bookmark
          handleClick={props.item.read ? handleUnRead : handleRead}
          read={props.item.read}
          data-test-id={`purchased-item-${props.item.read ? 'unread' : 'read'}-${props.item.id}`}
        />
      )}
      <Trash
        handleClick={() => props.handleItemDelete(props.item)}
        data-test-id={`purchased-item-delete-${props.item.id}`}
      />
    </ButtonGroup>
  );
}

PurchasedItemButtons.propTypes = {
  listType: PropTypes.string.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    read: PropTypes.bool,
    completed: PropTypes.bool,
    purchased: PropTypes.bool,
  }).isRequired,
  handleItemUnPurchase: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  handleReadOfItem: PropTypes.func.isRequired,
  handleUnReadOfItem: PropTypes.func.isRequired,
};

export default PurchasedItemButtons;
