import React from 'react';
import PropTypes from 'prop-types';

import NotPurchased from './NotPurchased';
import Purchased from './Purchased';

const ListItemButtons = (props) =>
  props.purchased ? (
    <Purchased
      listType={props.listType}
      item={props.item}
      handleItemUnPurchase={props.handleItemUnPurchase}
      handleItemDelete={props.handleItemDelete}
      toggleItemRead={props.toggleItemRead}
    />
  ) : (
    <NotPurchased
      listType={props.listType}
      item={props.item}
      handlePurchaseOfItem={props.handlePurchaseOfItem}
      handleItemDelete={props.handleItemDelete}
      toggleItemRead={props.toggleItemRead}
    />
  );

ListItemButtons.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    read: PropTypes.bool,
  }).isRequired,
  purchased: PropTypes.bool.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleItemUnPurchase: PropTypes.func.isRequired,
  listType: PropTypes.string.isRequired,
  toggleItemRead: PropTypes.func.isRequired,
};

export default ListItemButtons;
