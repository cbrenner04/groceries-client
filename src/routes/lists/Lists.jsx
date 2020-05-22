import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import { fetchLists } from './utils';
import ListsContainer from './containers/ListsContainer';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

function Lists(props) {
  return (
    <Async promiseFn={fetchLists} history={props.history}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
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
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}

Lists.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      errors: PropTypes.string,
      success: PropTypes.string,
    }),
  }),
};

export default Lists;
