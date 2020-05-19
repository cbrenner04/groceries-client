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
        <Refresh handleClick={() => props.handleItemUnPurchase(props.item)} />
      )}
      {props.listType === 'BookList' && (
        <Bookmark handleClick={props.item.read ? handleUnRead : handleRead} read={props.item.read} />
      )}
      <Trash handleClick={() => props.handleItemDelete(props.item)} />
    </ButtonGroup>
  );
}

PurchasedItemButtons.propTypes = {
  listType: PropTypes.string.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    read: PropTypes.bool,
  }).isRequired,
  handleItemUnPurchase: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  handleReadOfItem: PropTypes.func.isRequired,
  handleUnReadOfItem: PropTypes.func.isRequired,
};

export default PurchasedItemButtons;
