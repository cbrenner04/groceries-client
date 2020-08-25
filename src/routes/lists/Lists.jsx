import React, { useContext } from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import { fetchLists } from './utils';
import ListsContainer from './containers/ListsContainer';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';
import { UserContext } from '../../context/UserContext';
import { ActionCableContextProvider } from '../../context/ActionCableContext';

function Lists(props) {
  const { user } = useContext(UserContext);
  let wsUrl = process.env.REACT_APP_WS_BASE;
  if (user) {
    const { accessToken, client, uid } = user;
    wsUrl = `${process.env.REACT_APP_WS_BASE}/?access-token=${accessToken}&uid=${uid}&client=${client}`;
  }

  return (
    <ActionCableContextProvider url={wsUrl}>
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
    </ActionCableContextProvider>
  );
}

Lists.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default Lists;
