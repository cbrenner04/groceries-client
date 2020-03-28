import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import ShareListForm from './containers/ShareListForm';
import { fetchData } from './utils';
import Alert from '../../components/Alert';

function ShareList(props) {
  return (
    <Async promiseFn={fetchData} listId={props.match.params.list_id} history={props.history}>
      <Async.Pending>Loading...</Async.Pending>
      <Async.Fulfilled>
        {data => (
          <ShareListForm
            history={props.history}
            name={data.name}
            invitableUsers={data.invitableUsers}
            listId={data.listId}
            userIsOwner={data.userIsOwner}
            pending={data.pending}
            accepted={data.accepted}
            refused={data.refused}
            userId={data.userId}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>{error => <Alert errors={error.message} />}</Async.Rejected>
    </Async>
  );
}

ShareList.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      list_id: PropTypes.string,
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default ShareList;
