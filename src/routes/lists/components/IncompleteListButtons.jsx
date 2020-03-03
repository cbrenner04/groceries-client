import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as $ from 'jquery';
import * as config from '../../../config/default';
import { setUserInfo } from '../../../utils/auth';

function IncompleteListButtons(props) {
  const [currentUserPermissions, setCurrentUserPermissions] = useState('read');

  useEffect(() => {
    $.ajax({
      type: 'GET',
      url: `${config.apiBase}/lists/${props.list.id}/users_lists/${props.list.users_list_id}`,
      dataType: 'JSON',
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done(({ permissions }, _status, request) => {
      setUserInfo(request);
      setCurrentUserPermissions(permissions);
    });
  }, [props.list.id, props.list.users_list_id]);

  return (
    <div className="btn-group float-right" role="group">
      <button
        onClick={() => props.onListCompletion(props.list)}
        className="btn btn-link p-0 mr-3"
        disabled={props.userId !== props.list.owner_id}
        style={{ opacity: props.userId !== props.list.owner_id ? 0.3 : 1 }}
        data-test-id="incomplete-list-complete"
      >
        <i className="fa fa-check fa-2x text-success" />
      </button>
      <Link
        to={`lists/${props.list.id}/users_lists`}
        className="btn btn-link p-0 mr-3"
        disabled={currentUserPermissions !== 'write'}
        style={{
          pointerEvents: currentUserPermissions !== 'write' ? 'none' : 'auto',
          opacity: currentUserPermissions !== 'write' ? 0.3 : 1,
        }}
        data-test-id="incomplete-list-share"
      >
        <i className="fa fa-users fa-2x text-primary" />
      </Link>
      <Link
        to={`/lists/${props.list.id}/edit`}
        className="btn btn-link p-0 mr-3"
        disabled={props.userId !== props.list.owner_id}
        style={{
          pointerEvents: props.userId !== props.list.owner_id ? 'none' : 'auto',
          opacity: props.userId !== props.list.owner_id ? 0.3 : 1,
        }}
        data-test-id="incomplete-list-edit"
      >
        <i className="fa fa-edit fa-2x text-warning" />
      </Link>
      <button
        onClick={() => props.onListDeletion(props.list)}
        className="btn btn-link p-0"
        disabled={props.userId !== props.list.owner_id}
        style={{ opacity: props.userId !== props.list.owner_id ? 0.3 : 1 }}
        data-test-id="incomplete-list-trash"
      >
        <i className="fa fa-trash fa-2x text-danger" />
      </button>
    </div>
  );
}

IncompleteListButtons.propTypes = {
  userId: PropTypes.number.isRequired,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
  }).isRequired,
  onListCompletion: PropTypes.func.isRequired,
  onListDeletion: PropTypes.func.isRequired,
};

export default IncompleteListButtons;
