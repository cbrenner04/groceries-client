import React from 'react';
import PropTypes from 'prop-types';
import { Col, ListGroup, Row } from 'react-bootstrap';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';

import { formatDate } from '../../../utils/format';
import listIconClass from '../../../utils/list_icon';
import { list } from '../../../types';

function List(props) {
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
      className={`${props.listClass} list-list-group-item`}
      data-test-class={props.testClass}
      data-test-id={`list-${props.list.id}`}
    >
      <Row className={props.multiSelect ? 'list-item-row' : ''}>
        {props.multiSelect && (
          <Col xs="1" className="mx-sm-auto">
            <input type="checkbox" className="multi-select-check" onClick={() => handleListSelect(props.list)} />
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
};

export default List;
