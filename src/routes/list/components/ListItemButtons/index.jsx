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
      handleReadOfItem={props.handleReadOfItem}
      handleUnReadOfItem={props.handleUnReadOfItem}
    />
  ) : (
    <NotPurchased
      listType={props.listType}
      item={props.item}
      handlePurchaseOfItem={props.handlePurchaseOfItem}
      handleItemDelete={props.handleItemDelete}
      handleReadOfItem={props.handleReadOfItem}
      handleUnReadOfItem={props.handleUnReadOfItem}
    />
  );

ListItemButtons.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    product: PropTypes.string,
    task: PropTypes.string,
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
  }).isRequired,
  purchased: PropTypes.bool,
  handleItemDelete: PropTypes.func.isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleReadOfItem: PropTypes.func.isRequired,
  handleUnReadOfItem: PropTypes.func.isRequired,
  handleItemUnPurchase: PropTypes.func.isRequired,
  listType: PropTypes.string.isRequired,
};

export default ListItemButtons;
