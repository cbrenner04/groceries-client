import React from 'react';
import PropTypes from 'prop-types';
import { Col, ListGroup, Row } from 'react-bootstrap';
import update from 'immutability-helper';

import { prettyDueBy } from '../../../utils/format';
import ListItemButtons from './ListItemButtons';
import { itemName } from '../utils';

const ListItem = (props) => {
  let assignee = '';
  if (props.listType === 'ToDoList' && props.item.assignee_id) {
    const assignedUser = props.listUsers.find((user) => user.id === props.item.assignee_id);
    if (assignedUser) {
      assignee = `Assigned To: ${assignedUser.email}`;
    }
  }

  const updateSelectedItems = () => {
    const updatedItems = update(props.selectedItems, { $push: [props.item] });
    props.setSelectedItems(updatedItems);
  };

  return (
    <ListGroup.Item
      key={props.item.id}
      style={{ display: 'block' }}
      data-test-class={props.purchased ? 'purchased-item' : 'non-purchased-item'}
    >
      <Row className={props.multiSelect ? 'list-item-row' : ''}>
        {props.multiSelect && (
          <Col xs="1" className="mx-sm-auto">
            <input
              type="checkbox"
              style={{ position: 'absolute', top: '40%', left: '40%' }}
              onClick={updateSelectedItems}
            />
            <div className="list-item-multi-divider"></div>
          </Col>
        )}
        <Col xs={props.multiSelect ? 10 : 12} sm={props.multiSelect ? 11 : 12}>
          <div className="pt-1">{itemName(props.item, props.listType)}</div>
          {props.listType === 'ToDoList' && (
            <div className="pt-1">
              <small className="text-muted">
                <div data-test-id="assignee-email">{assignee}</div>
                <div data-test-id="due-by">{props.item.due_by ? `Due By: ${prettyDueBy(props.item.due_by)}` : ''}</div>
              </small>
            </div>
          )}
          {props.permission === 'write' && (
            <ListItemButtons
              purchased={props.purchased}
              listType={props.listType}
              item={props.item}
              handleItemUnPurchase={props.handleItemUnPurchase}
              handleItemDelete={props.handleItemDelete}
              handlePurchaseOfItem={props.handlePurchaseOfItem}
              toggleItemRead={props.toggleItemRead}
              handleItemEdit={props.handleItemEdit}
            />
          )}
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

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
    completed: PropTypes.bool,
    purchased: PropTypes.bool,
  }).isRequired,
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
  handleItemEdit: PropTypes.func.isRequired,
};

ListItem.defaultProps = {
  listUsers: [],
  purchased: false,
};

export default ListItem;
