import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import Alert from '../../components/Alert';
import { fetchLists } from './utils';
import ListsContainer from './containers/ListsContainer';
import Loading from '../../components/Loading';

function Lists(props) {
  return (
    <Async promiseFn={fetchLists} history={props.history}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {data => (
          <ListsContainer
            history={props.history}
            userId={data.userId}
            pendingLists={data.pendingLists}
            completedLists={data.completedLists}
            nonCompletedLists={data.nonCompletedLists}
            currentUserPermissions={data.currentUserPermissions}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>{error => <Alert errors={error.message} />}</Async.Rejected>
    </Async>
  );
}

Lists.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default Lists;
