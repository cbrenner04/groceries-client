import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Col, ListGroup, Row } from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';

import { prettyDueBy } from '../../../utils/format';
import ListItemButtons from './ListItemButtons';
import { itemName } from '../utils';
import { listItem, listUsers } from '../../../types';

const ListItem = (props) => {
  const dndType = 'list-item';
  const ref = useRef();
  const [{ handlerId }, drop] = useDrop(() => ({
    accept: dndType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    // drop() {
    //   // noop
    // },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = props.index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current && ref.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      props.moveItem(dragIndex, hoverIndex, item.category);
    },
  }));
  const [{ isDragging }, drag] = useDrag(() => ({
    type: dndType,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => ({ type: dndType, id: props.item.id, index: props.index, category: props.item.category }),
  }));
  if (!props.purchased && props.permission === 'write') {
    drag(drop(ref));
  }

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
      className="list-item-list-group-item"
      data-test-class={props.purchased ? 'purchased-item' : 'non-purchased-item'}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      ref={ref}
      data-handler-id={handlerId}
    >
      <Row className={props.multiSelect ? 'list-item-row' : ''}>
        {props.multiSelect && (
          <Col xs="1">
            <input type="checkbox" className="multi-select-check" onClick={() => props.handleItemSelect(props.item)} />
            <div className="list-item-multi-divider"></div>
          </Col>
        )}
        <Col xs={props.multiSelect ? 10 : 12} sm={props.multiSelect ? 11 : 12}>
          <div className={`${props.multiSelect ? 'ms-3 ms-sm-2' : ''} pt-1`}>
            {itemName(props.item, props.listType)}
          </div>
          {props.listType === 'ToDoList' && (
            <div className={`${props.multiSelect ? 'ms-3 ms-sm-2' : ''} pt-1`}>
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
  index: PropTypes.number.isRequired,
  moveItem: PropTypes.func,
};

ListItem.defaultProps = {
  listUsers: [],
  purchased: false,
  moveItem: () => undefined,
};

export default ListItem;
