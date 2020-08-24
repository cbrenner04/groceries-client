import React from 'react';
import PropTypes from 'prop-types';
import { Col, ListGroup, Row } from 'react-bootstrap';

import { prettyDueBy } from '../../../utils/format';
import ListItemButtons from './ListItemButtons';
import { itemName } from '../utils';
import { listItem, listUsers } from '../../../types';

const ListItem = (props) => {
  let assignee = '';
  if (props.listType === 'ToDoList' && props.item.assignee_id) {
    const assignedUser = props.listUsers.find((user) => user.id === props.item.assignee_id);
    if (assignedUser) {
      assignee = `Assigned To: ${assignedUser.email}`;
    }
  }

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
              onClick={() => props.handleItemSelect(props.item)}
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
              handleItemRefresh={props.handleItemRefresh}
              handleItemDelete={props.handleItemDelete}
              handlePurchaseOfItem={props.handlePurchaseOfItem}
              toggleItemRead={props.toggleItemRead}
              handleItemEdit={props.handleItemEdit}
              multiSelect={props.multiSelect}
              selectedItems={props.selectedItems}
              pending={props.pending}
            />
          )}
        </Col>
      </Row>
    </ListGroup.Item>
  );
};

ListItem.propTypes = {
  item: listItem.isRequired,
  purchased: PropTypes.bool,
  handleItemDelete: PropTypes.func.isRequired,
  handlePurchaseOfItem: PropTypes.func.isRequired,
  handleItemRefresh: PropTypes.func.isRequired,
  listType: PropTypes.string.isRequired,
  listUsers: PropTypes.arrayOf(listUsers),
  permission: PropTypes.string.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  handleItemSelect: PropTypes.func.isRequired,
  toggleItemRead: PropTypes.func.isRequired,
  handleItemEdit: PropTypes.func.isRequired,
  selectedItems: PropTypes.arrayOf(listItem).isRequired,
  pending: PropTypes.bool.isRequired,
};

ListItem.defaultProps = {
  listUsers: [],
  purchased: false,
};

export default ListItem;
