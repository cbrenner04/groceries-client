import React from 'react';
import PropTypes from 'prop-types';
import { Col, ListGroup, Row } from 'react-bootstrap';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';

import { formatDate } from '../../../utils/format';
import listIconClass from '../../../utils/list_icon';

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
      className={props.listClass}
      style={{ display: 'block' }}
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
  list: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    users_list_id: PropTypes.string,
    owner_id: PropTypes.string.isRequired,
    refreshed: PropTypes.bool.isRequired,
  }).isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.string,
      owner_id: PropTypes.string.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }).isRequired,
  ).isRequired,
  setSelectedLists: PropTypes.func.isRequired,
};

export default List;
