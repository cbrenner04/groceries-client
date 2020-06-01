import React from 'react';
import PropTypes from 'prop-types';
import { Badge, ListGroup } from 'react-bootstrap';

const PermissionButtons = (props) => (
  <>
    <h3 className="text-capitalize">{props.status}</h3>
    <br />
    <ListGroup>
      {props.users.map(({ user, users_list: { id, permissions } }) => {
        if (user.id === props.userId) {
          return '';
        }
        if (props.userIsOwner) {
          return (
            <div key={id} data-test-id={`${props.status}-user-${user.id}`}>
              <ListGroup.Item
                action
                className={'d-flex justify-content-between align-items-center'}
                onClick={() => props.togglePermission(id, permissions, props.status)}
              >
                <span>{user.email}</span>
                <Badge data-test-id={`perm-${permissions}`} variant={permissions === 'write' ? 'success' : 'primary'}>
                  {permissions}
                </Badge>
              </ListGroup.Item>
            </div>
          );
        }
        return (
          <div key={id} data-test-id={`${props.status}-user-${user.id}`}>
            <ListGroup.Item>{user.email}</ListGroup.Item>
          </div>
        );
      })}
    </ListGroup>
    <br />
  </>
);

PermissionButtons.propTypes = {
  togglePermission: PropTypes.func.isRequired,
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

export default PermissionButtons;
