import React from 'react';
import PropTypes from 'prop-types';

import NotPurchased from './NotPurchased';
import Purchased from './Purchased';

const ListItemButtons = (props) =>
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
    />
  ) : (
    <NotPurchased
      listType={props.listType}
      item={props.item}
      handlePurchaseOfItem={props.handlePurchaseOfItem}
      handleItemDelete={props.handleItemDelete}
      toggleItemRead={props.toggleItemRead}
      handleItemEdit={props.handleItemEdit}
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
  handleItemRefresh: PropTypes.func.isRequired,
  listType: PropTypes.string.isRequired,
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

export default ListItemButtons;
