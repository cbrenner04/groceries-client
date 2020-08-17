import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Button, ButtonGroup, Col, ListGroup, Row } from 'react-bootstrap';

import { Trash } from '../../../components/ActionButtons';
import TitlePopover from '../../../components/TitlePopover';

const UsersList = (props) => (
  <>
    <TitlePopover
      title={props.status}
      message="Click the arrows to upgrade or downgrade the permissions between read and write"
    />
    <ListGroup className="mb-4">
      {props.users.map(({ user, users_list: { id, permissions } }) => {
        if (user.id === props.userId) {
          return '';
        }
        if (props.userIsOwner) {
          return (
            <ListGroup.Item key={id} data-test-id={`${props.status}-user-${user.id}`} style={{ display: 'block' }}>
              <Row>
                <Col md="6" className="pt-1">
                  {user.email}
                </Col>
                <Col md="4" className="pt-1">
                  <Badge data-test-id={`perm-${permissions}`} variant={permissions === 'write' ? 'success' : 'primary'}>
                    {permissions}
                  </Badge>
                </Col>
                <Col md="2">
                  <ButtonGroup className="float-right">
                    <>
                      <Button
                        variant="link"
                        className="p-0 mr-4"
                        onClick={() => props.togglePermission(id, permissions, props.status)}
                        data-test-id="toggle-permissions"
                      >
                        <i
                          className={`fas fa-angle-double-${
                            permissions === 'write' ? 'down' : 'up'
                          } fa-2x text-warning`}
                        />
                      </Button>
                      <Trash testID="remove-share" handleClick={() => props.removeShare(id)} disabled={false} />
                    </>
                  </ButtonGroup>
                </Col>
              </Row>
            </ListGroup.Item>
          );
        }
        return (
          <div key={id} data-test-id={`${props.status}-user-${user.id}`}>
            <ListGroup.Item>{user.email}</ListGroup.Item>
          </div>
        );
      })}
    </ListGroup>
  </>
);

UsersList.propTypes = {
  togglePermission: PropTypes.func.isRequired,
  removeShare: PropTypes.func.isRequired,
  userIsOwner: PropTypes.bool.isRequired,
  userId: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.shape({
        id: PropTypes.number,
        email: PropTypes.string,
      }),
      users_list: PropTypes.shape({
        id: PropTypes.number,
        permissions: PropTypes.string,
      }),
    }).isRequired,
  ).isRequired,
};

export default UsersList;
