import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Col, ListGroup, Row } from 'react-bootstrap';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';
import { useDrag, useDrop } from 'react-dnd';

import { formatDate } from '../../../utils/format';
import listIconClass from '../../../utils/list_icon';
import { list } from '../../../types';

function List(props) {
  const dndType = 'list';
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
      props.moveList(dragIndex, hoverIndex);
    },
  }));
  const [{ isDragging }, drag] = useDrag(() => ({
    type: dndType,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => ({ type: dndType, id: props.list.id, index: props.index }),
  }));
  if (props.draggable) {
    drag(drop(ref));
  }

  const handleListSelect = (list) => {
    const listIds = props.selectedLists.map((l) => l.id).join(',');
    let updatedLists;
    if (listIds.includes(list.id)) {
      updatedLists = props.selectedLists.filter((l) => l.id !== list.id);
    } else {
      updatedLists = update(props.selectedLists, { $push: [list] });
    }
    props.setSelectedLists(updatedLists);
  };

  const listName = (
    <h5 className="mb-1">
      <i className={`fa ${listIconClass(props.list.type)} text-secondary me-3`} />
      {props.listName}
    </h5>
  );

  const listNameElement = props.includeLinkToList ? (
    <Link to={`/lists/${props.list.id}`} className="router-link">
      {listName}
    </Link>
  ) : (
    listName
  );

  return (
    <ListGroup.Item
      className={`${props.listClass} list-list-group-item`}
      data-test-class={props.testClass}
      data-test-id={`list-${props.list.id}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      ref={ref}
      data-handler-id={handlerId}
    >
      <Row className={props.multiSelect ? 'list-item-row' : ''}>
        {props.multiSelect && (
          <Col xs="1" className="mx-sm-auto">
            <input type="checkbox" className="multi-select-check" onClick={() => handleListSelect(props.list)} />
            <div className="list-item-multi-divider"></div>
          </Col>
        )}
        <Col xs={props.multiSelect ? 10 : 12} sm={props.multiSelect ? 11 : 12}>
          <Row className={`${props.multiSelect ? 'ms-1' : ''} pt-1`}>
            <Col lg="6">{listNameElement}</Col>
            <Col lg="4" className={props.multiSelect ? 'list-multi-created-at' : ''}>
              <small className="text-muted">{formatDate(props.list.created_at)}</small>
            </Col>
            <Col lg="2" className={`${props.multiSelect ? 'list-multi-buttons' : ''} pe-lg-3`}>
              {props.listButtons}
            </Col>
          </Row>
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

List.propTypes = {
  listButtons: PropTypes.element.isRequired,
  listName: PropTypes.string.isRequired,
  listClass: PropTypes.string.isRequired,
  testClass: PropTypes.string.isRequired,
  includeLinkToList: PropTypes.bool.isRequired,
  list: list.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedLists: PropTypes.arrayOf(list).isRequired,
  setSelectedLists: PropTypes.func.isRequired,
  draggable: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  moveList: PropTypes.func,
};

List.defaultProps = {
  moveList: () => undefined,
};

export default List;
