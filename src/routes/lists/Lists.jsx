import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';
import { ActionCableProvider } from 'react-actioncable-provider';

import { fetchLists } from './utils';
import ListsContainer from './containers/ListsContainer';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

function Lists(props) {
  const { 'access-token': accessToken, uid, client } = JSON.parse(sessionStorage.getItem('user'));
  const wsUrl = `${process.env.REACT_APP_WS_BASE}/?access-token=${accessToken}&uid=${uid}&client=${client}`;

  return (
    <ActionCableProvider url={wsUrl}>
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
              incompleteLists={data.incompleteLists}
              currentUserPermissions={data.currentUserPermissions}
            />
          )}
        </Async.Fulfilled>
        <Async.Rejected>
          <UnknownError />
        </Async.Rejected>
      </Async>
    </ActionCableProvider>
  );
}

Lists.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default Lists;
