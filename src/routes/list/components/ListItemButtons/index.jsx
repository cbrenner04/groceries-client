import React from 'react';
import PropTypes from 'prop-types';

import NotPurchased from './NotPurchased';
import Purchased from './Purchased';
import { listItem } from '../../../../types';

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
      pending={props.pending}
    />
  ) : (
    <NotPurchased
      listType={props.listType}
      item={props.item}
      handlePurchaseOfItem={props.handlePurchaseOfItem}
      handleItemDelete={props.handleItemDelete}
      toggleItemRead={props.toggleItemRead}
      handleItemEdit={props.handleItemEdit}
      pending={props.pending}
    />
  );

ListItemButtons.propTypes = {
  item: listItem.isRequired,
  purchased: PropTypes.bool.isRequired,
  handleItemDelete: PropTypes.func.isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleItemRefresh: PropTypes.func.isRequired,
  listType: PropTypes.string.isRequired,
  toggleItemRead: PropTypes.func.isRequired,
  handleItemEdit: PropTypes.func.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedItems: PropTypes.arrayOf(listItem).isRequired,
  pending: PropTypes.bool.isRequired,
};

export default ListItemButtons;
