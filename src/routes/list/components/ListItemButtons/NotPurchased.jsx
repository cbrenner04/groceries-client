import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Bookmark, Complete, EditButton, Trash } from '../../../../components/ActionButtons';

function NotPurchasedItemButtons(props) {
  return (
    <ButtonGroup className="float-right">
      {props.listType === 'BookList' && (
        <Bookmark
          handleClick={() => props.toggleItemRead(props.item)}
          read={props.item.read}
          testID={`not-purchased-item-${props.item.read ? 'unread' : 'read'}-${props.item.id}`}
        />
      )}
      <Complete
        handleClick={() => props.handlePurchaseOfItem(props.item)}
        testID={`not-purchased-item-complete-${props.item.id}`}
      />
      <EditButton
        handleClick={() => props.handleItemEdit(props.item)}
        testID={`not-purchased-item-edit-${props.item.id}`}
      />
      <Trash
        handleClick={() => props.handleItemDelete(props.item)}
        testID={`not-purchased-item-delete-${props.item.id}`}
      />
    </ButtonGroup>
  );
}

NotPurchasedItemButtons.propTypes = {
  listType: PropTypes.string.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    read: PropTypes.bool,
    completed: PropTypes.bool,
    purchased: PropTypes.bool,
  }).isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  toggleItemRead: PropTypes.func.isRequired,
  handleItemEdit: PropTypes.func.isRequired,
};

export default NotPurchasedItemButtons;
