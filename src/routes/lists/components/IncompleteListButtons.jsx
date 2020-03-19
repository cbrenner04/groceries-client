import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';
import axios from 'axios';

import { setUserInfo } from '../../../utils/auth';
import { Complete, Edit, Share, Trash } from '../../../components/ActionButtons';

function IncompleteListButtons(props) {
  const [currentUserPermissions, setCurrentUserPermissions] = useState('read');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/lists/${props.list.id}/users_lists/${props.list.users_list_id}`, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ data: { permissions }, headers }) => {
      setUserInfo(headers);
      setCurrentUserPermissions(permissions);
    }).catch(() => {
      // noop
    });
  }, [props.list.id, props.list.users_list_id]);

  return (
    <ButtonGroup className="float-right">
      <Complete
        handleClick={() => props.onListCompletion(props.list)}
        disabled={props.userId !== props.list.owner_id}
        style={{ opacity: props.userId !== props.list.owner_id ? 0.3 : 1 }}
        data-test-id="incomplete-list-complete"
      />
      <Share
        to={`lists/${props.list.id}/users_lists`}
        disabled={currentUserPermissions !== 'write'}
        style={{
          pointerEvents: currentUserPermissions !== 'write' ? 'none' : 'auto',
          opacity: currentUserPermissions !== 'write' ? 0.3 : 1,
        }}
        data-test-id="incomplete-list-share"
      />
      <Edit
        to={`/lists/${props.list.id}/edit`}
        disabled={props.userId !== props.list.owner_id}
        style={{
          pointerEvents: props.userId !== props.list.owner_id ? 'none' : 'auto',
          opacity: props.userId !== props.list.owner_id ? 0.3 : 1,
        }}
        data-test-id="incomplete-list-edit"
      />
      <Trash
        handleClick={() => props.onListDeletion(props.list)}
        disabled={props.userId !== props.list.owner_id}
        style={{ opacity: props.userId !== props.list.owner_id ? 0.3 : 1 }}
        data-test-id="incomplete-list-trash"
      />
    </ButtonGroup>
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
