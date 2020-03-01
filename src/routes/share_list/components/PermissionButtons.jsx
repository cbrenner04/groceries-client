import React from 'react';
import PropTypes from 'prop-types';

const PermissionButtons = props => (
  <div>
    <h3 className="text-capitalize">{props.status}</h3>
    <br />
    {
      props.users.map(({ user, users_list: { id, permissions } }) => {
        if (user.id === props.userId) return '';
        if (props.userIsOwner) {
          return (
            <button
              key={id}
              id={`${props.status}-user-${user.id}`}
              className={'list-group-item list-group-item-action d-flex justify-content-between align-items-center'
                + 'btn btn-link'}
              onClick={() => props.togglePermission(id, permissions, props.status)}
            >
              <span>{user.email}</span>
              <span
                id={`perm-${permissions}`}
                className={`badge badge-${permissions === 'write' ? 'success' : 'primary'}`}
              >
                {permissions}
              </span>
            </button>
          );
        }
        return <div key={id} id={`${props.status}-user-${user.id}`} className="list-group-item">{user.email}</div>;
      })
    }
    <br />
  </div>
);

PermissionButtons.propTypes = {
  togglePermission: PropTypes.func.isRequired,
  userIsOwner: PropTypes.bool.isRequired,
  userId: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    email: PropTypes.string,
  }).isRequired).isRequired,
};

export default PermissionButtons;
