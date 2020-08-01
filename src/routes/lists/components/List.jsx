import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Col, ListGroup, Row } from 'react-bootstrap';
import update from 'immutability-helper';

import { formatDate } from '../../../utils/format';
import listIconClass from '../../../utils/list_icon';
import ListButtons from '../components/ListButtons';

function List(props) {
  const acceptedListTestClass = props.list.completed ? 'completed-list' : 'non-completed-list';

  const listTitle = (
    <h5 className="mb-1">
      <i className={`fa ${listIconClass(props.list.type)} text-info mr-3`} />
      {props.list.name}
      {props.list.refreshed && '*'}
    </h5>
  );

  const acceptedListLink = (
    <Link to={`/lists/${props.list.id}`} className="router-link">
      {listTitle}
    </Link>
  );

  const handleListSelect = (list) => {
    const listIds = props.selectedLists.map((i) => i.id).join(',');
    let updatedLists;
    if (listIds.includes(list.id)) {
      updatedLists = props.selectedLists.filter((i) => i.id !== list.id);
    } else {
      updatedLists = update(props.selectedLists, { $push: [list] });
    }
    props.setSelectedLists(updatedLists);
  };

  return (
    <ListGroup.Item
      className={props.accepted ? 'accepted-list' : 'pending-list'}
      style={{ display: 'block' }}
      data-test-class={props.accepted ? acceptedListTestClass : 'pending-list'}
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
              {props.accepted ? acceptedListLink : listTitle}
            </Col>
            <Col md="4" className={props.multiSelect ? 'list-multi-created pt-1' : 'pt-1'}>
              <small className="text-muted">{formatDate(props.list.created_at)}</small>
            </Col>
            <Col md="2">
              <ListButtons {...props} />
            </Col>
          </Row>
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

List.propTypes = {
  userId: PropTypes.number.isRequired,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number.isRequired,
    refreshed: PropTypes.bool.isRequired,
  }).isRequired,
  accepted: PropTypes.bool,
  onListDeletion: PropTypes.func,
  onListCompletion: PropTypes.func,
  onListRefresh: PropTypes.func,
  onListAcceptance: PropTypes.func,
  onListRejection: PropTypes.func,
  currentUserPermissions: PropTypes.string.isRequired,
  onListRemoval: PropTypes.func,
  multiSelect: PropTypes.bool,
  selectedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }).isRequired,
  ),
  setSelectedLists: PropTypes.func,
};

List.defaultProps = {
  onListDeletion: () => undefined,
  onListCompletion: () => undefined,
  onListRefresh: () => undefined,
  accepted: false,
  onListAcceptance: () => undefined,
  onListRejection: () => undefined,
  onListRemoval: () => undefined,
  multiSelect: false,
  selectedLists: [],
  setSelectedLists: () => undefined,
};

export default List;
