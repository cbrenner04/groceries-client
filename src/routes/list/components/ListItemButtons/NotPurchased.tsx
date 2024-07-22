import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Bookmark, Complete, EditButton, Trash } from '../../../../components/ActionButtons';
import { listItem } from '../../../../prop-types';

function NotPurchasedItemButtons(props) {
  return (
    <ButtonGroup className={`${props.multiSelect ? 'list-item-buttons' : ''} float-end`}>
      {props.listType === 'BookList' && (
        <Bookmark
          handleClick={() => props.toggleItemRead(props.item)}
          read={props.item.read}
          testID={`not-purchased-item-${props.item.read ? 'unread' : 'read'}-${props.item.id}`}
          disabled={props.pending}
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
}

NotPurchasedItemButtons.propTypes = {
  listType: PropTypes.string.isRequired,
  item: listItem.isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  toggleItemRead: PropTypes.func.isRequired,
  handleItemEdit: PropTypes.func.isRequired,
  pending: PropTypes.bool.isRequired,
  multiSelect: PropTypes.bool,
};

export default NotPurchasedItemButtons;
