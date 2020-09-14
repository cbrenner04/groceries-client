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
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: 'list',
    drop() {
      props.persistMoveList(props.list.id);
    },
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
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'list', id: props.list.id, index: props.index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0.5 : 1;
  if (!props.pending) {
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
      <i className={`fa ${listIconClass(props.list.type)} text-info mr-3`} />
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
      ref={ref}
      className={props.listClass}
      style={{ display: 'block', opacity }}
      data-test-class={props.testClass}
      data-test-id={`list-${props.list.id}`}
    >
      <Row className={props.multiSelect ? 'list-item-row' : ''}>
        {props.multiSelect && (
          <Col xs="1" className="mx-sm-auto">
            <input
              type="checkbox"
              style={{ position: 'absolute', top: '40%', left: '40%' }}
              onClick={() => handleListSelect(props.list)}
            />
            <div className="list-item-multi-divider"></div>
          </Col>
        )}
        <Col xs={props.multiSelect ? 10 : 12} sm={props.multiSelect ? 11 : 12}>
          <Row>
            <Col md="6" className="pt-1">
              {listNameElement}
            </Col>
            <Col md="4" className={props.multiSelect ? 'list-multi-created pt-1' : 'pt-1'}>
              <small className="text-muted">{formatDate(props.list.created_at)}</small>
            </Col>
            <Col md="2">{props.listButtons}</Col>
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
  index: PropTypes.number,
  moveList: PropTypes.func,
  persistMoveList: PropTypes.func,
  complete: PropTypes.bool,
  pending: PropTypes.bool,
};

List.defaultProps = {
  complete: false,
  pending: false,
  index: 0,
  moveList: () => undefined,
  persistMoveList: () => undefined,
};

export default List;
