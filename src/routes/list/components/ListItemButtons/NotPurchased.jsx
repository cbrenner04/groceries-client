import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { listTypeToSnakeCase } from '../../../../utils/format';
import { Bookmark, Complete, Edit, Trash } from '../../../../components/ActionButtons';

function NotPurchasedItemButtons(props) {
  const listItemPath = () => {
    const listId = props.item[`${listTypeToSnakeCase(props.listType)}_id`];
    return `/lists/${listId}/${listTypeToSnakeCase(props.listType)}_items`;
  };

  const handleRead = () => props.handleReadOfItem(props.item);
  const handleUnRead = () => props.handleUnReadOfItem(props.item);

  return (
    <ButtonGroup className="float-right">
      {props.listType === 'BookList' && (
        <Bookmark
          handleClick={props.item.read ? handleUnRead : handleRead}
          read={props.item.read}
          data-test-id={`not-purchased-item-${props.item.read ? 'unread' : 'read'}-${props.item.id}`}
        />
      )}
      <Complete
        handleClick={() => props.handlePurchaseOfItem(props.item)}
        data-test-id={`not-purchased-item-complete-${props.item.id}`}
      />
      <Edit to={`${listItemPath()}/${props.item.id}/edit`} />
      <Trash
        handleClick={() => props.handleItemDelete(props.item)}
        data-test-id={`not-purchased-item-delete-${props.item.id}`}
      />
    </ButtonGroup>
  );
}

NotPurchasedItemButtons.propTypes = {
  listType: PropTypes.string.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    read: PropTypes.bool,
  }).isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  handleReadOfItem: PropTypes.func.isRequired,
  handleUnReadOfItem: PropTypes.func.isRequired,
};

export default NotPurchasedItemButtons;
