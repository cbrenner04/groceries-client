import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';

import { Refresh } from '../../../components/ActionButtons';
import { usersLists } from '../../../types';

const RefusedUsersList = (props) => (
  <>
    <h2>Refused</h2>
    <ListGroup>
      {props.users.map(({ user, users_list: { id } }) => {
        if (user.id === props.userId) {
          return '';
        }
        if (props.userIsOwner) {
          return (
            <ListGroup.Item key={id} data-test-id={`refused-user-${user.id}`} style={{ display: 'block' }}>
              <Row>
                <Col md="6" className="pt-1">
                  {user.email}
                </Col>
                <Col md="4" className="pt-1"></Col>
                <Col md="2">
                  <ButtonGroup className="float-right">
                    <Refresh testID="refresh-share" handleClick={() => props.refreshShare(id, user.id)} />
                  </ButtonGroup>
                </Col>
              </Row>
            </ListGroup.Item>
          );
        }
        return (
          <div key={id} data-test-id={`refused-user-${user.id}`}>
            <ListGroup.Item>{user.email}</ListGroup.Item>
          </div>
        );
      })}
    </ListGroup>
  </>
);

RefusedUsersList.propTypes = {
  refreshShare: PropTypes.func.isRequired,
  userIsOwner: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(usersLists).isRequired,
};

export default RefusedUsersList;
