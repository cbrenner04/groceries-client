import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';

import { prettyDueBy } from '../../../utils/format';
import ListItemButtons from './ListItemButtons';
import { itemName } from '../utils';

const ListItem = (props) => (
  <ListGroup.Item
    key={props.item.id}
    style={{ display: 'block' }}
    data-test-class={props.purchased ? 'purchased-item' : 'non-purchased-item'}
  >
    <div className="pt-1">{itemName(props.item, props.listType)}</div>
    <div className="pt-1">
      {props.listType === 'ToDoList' && (
        <small className="text-muted">
          <div>
            {props.item.assignee_id && props.listUsers.length
              ? `Assigned To: ${props.listUsers.find((user) => user.id === props.item.assignee_id).email}`
              : ''}
          </div>
          <>{props.item.due_by ? `Due By: ${prettyDueBy(props.item.due_by)}` : ''}</>
        </small>
      )}
    </div>
    {props.permission === 'write' && (
      <ListItemButtons
        purchased={props.purchased}
        listType={props.listType}
        item={props.item}
        handleItemUnPurchase={props.handleItemUnPurchase}
        handleItemDelete={props.handleItemDelete}
        handleReadOfItem={props.handleReadOfItem}
        handleUnReadOfItem={props.handleUnReadOfItem}
        handlePurchaseOfItem={props.handlePurchaseOfItem}
      />
    )}
  </ListGroup.Item>
);

ListItem.propTypes = {
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
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
    }),
  ),
  permission: PropTypes.string.isRequired,
};

ListItem.defaultProps = {
  listUsers: [],
  purchased: false,
};

export default ListItem;
