import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';

import { capitalize } from '../../../utils/format';
import ListItem from './ListItem';

function ListItems(props) {
  return (
    <ListGroup>
      {props.category && <h5 data-test-class="category-header">{capitalize(props.category)}</h5>}
      {props.items.map((item) => (
        <ListItem
          item={item}
          key={item.id}
          purchased={props.purchased}
          handleItemDelete={props.handleItemDelete}
          handlePurchaseOfItem={props.handlePurchaseOfItem}
          handleItemUnPurchase={props.handleItemUnPurchase}
          listType={props.listType}
          listUsers={props.listUsers}
          permission={props.permission}
          multiSelect={props.multiSelect}
          selectedItems={props.selectedItems}
          setSelectedItems={props.setSelectedItems}
          toggleItemRead={props.toggleItemRead}
        />
      ))}
    </ListGroup>
  );
}

ListItems.propTypes = {
  category: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      product: PropTypes.string,
      task: PropTypes.string,
      quantity: PropTypes.string,
      author: PropTypes.string,
      title: PropTypes.string,
      artist: PropTypes.string,
      album: PropTypes.string,
      assignee_id: PropTypes.number,
      due_by: PropTypes.date,
      read: PropTypes.bool,
      number_in_series: PropTypes.number,
      category: PropTypes.string,
      completed: PropTypes.bool,
      purchased: PropTypes.bool,
    }).isRequired,
  ),
  purchased: PropTypes.bool,
  handleItemDelete: PropTypes.func.isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleItemUnPurchase: PropTypes.func.isRequired,
  listType: PropTypes.string.isRequired,
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
    }),
  ),
  permission: PropTypes.string.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedItems: PropTypes.array.isRequired,
  setSelectedItems: PropTypes.func.isRequired,
  toggleItemRead: PropTypes.func.isRequired,
};

ListItems.defaultProps = {
  items: [],
  listUsers: [],
  purchased: false,
  category: '',
};

export default ListItems;
