import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import UnknownError from '../error_pages/UnknownError';
import { fetchCompletedLists } from './utils';
import CompletedListsContainer from './containers/CompletedListsContainer';
import Loading from '../../components/Loading';

function CompletedLists(props) {
  return (
    <Async promiseFn={fetchCompletedLists} history={props.history}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
          <CompletedListsContainer
            completedLists={data.completedLists}
            currentUserPermissions={data.currentUserPermissions}
            history={props.history}
            userId={data.userId}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}

CompletedLists.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default CompletedLists;
