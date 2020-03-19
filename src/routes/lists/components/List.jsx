import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Col, ListGroup, Row } from 'react-bootstrap';

import { formatDate } from '../../../utils/format';
import listIconClass from '../../../utils/list_icon';
import CompletedListButtons from './CompleteListButtons';
import IncompleteListButtons from './IncompleteListButtons';
import PendingListButtons from './PendingListButtons';

function List(props) {
  const { list } = props;

  const acceptedListButtons = () =>
    list.completed ? (
      <CompletedListButtons
        userId={props.userId}
        list={props.list}
        onListRefresh={props.onListRefresh}
        onListDeletion={props.onListDeletion}
      />
    ) : (
      <IncompleteListButtons
        userId={props.userId}
        list={props.list}
        onListCompletion={props.onListCompletion}
        onListDeletion={props.onListDeletion}
      />
    );

  const acceptedListTestClass = () => (list.completed ? 'completed-list' : 'non-completed-list');

  const listTitle = () => (
    <h5 className="mb-1">
      <i className={`fa ${listIconClass(list.type)} text-info mr-3`} />
      {list.name}
      {list.refreshed && '*'}
    </h5>
  );

  const acceptedListLink = () => (
    <Link to={`/lists/${list.id}`} className="router-link">
      {listTitle()}
    </Link>
  );

  return (
    <ListGroup.Item
      className={props.accepted ? 'accepted-list' : 'pending-list'}
      style={{ display: 'block' }}
      data-test-class={props.accepted ? acceptedListTestClass() : 'pending-list'}
    >
      <Row>
        <Col md="6" className="pt-1">
          {props.accepted ? acceptedListLink() : listTitle()}
        </Col>
        <Col md="4" className="pt-1">
          <small className="text-muted">{formatDate(list.created_at)}</small>
        </Col>
        <Col md="2">
          {props.accepted ? (
            acceptedListButtons()
          ) : (
            <PendingListButtons
              list={list}
              onListAcceptance={props.onListAcceptance}
              onListRejection={props.onListRejection}
            />
          )}
        </Col>
      </Row>
    </ListGroup.Item>
  );
}

List.propTypes = {
  userId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
    refreshed: PropTypes.bool,
  }).isRequired,
  accepted: PropTypes.bool,
  onListDeletion: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  onListCompletion: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  onListRefresh: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
  onListAcceptance: PropTypes.func,
  onListRejection: PropTypes.func,
};

List.defaultProps = {
  onListDeletion: null,
  onListCompletion: null,
  onListRefresh: null,
  accepted: false,
  onListAcceptance: null,
  onListRejection: null,
};

export default List;
