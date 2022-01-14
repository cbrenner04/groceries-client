import React from 'react';
import Async from 'react-async';
import { useNavigate } from 'react-router-dom';

import { fetchLists } from './utils';
import ListsContainer from './containers/ListsContainer';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

export default function Lists() {
  const navigate = useNavigate();

  return (
    <Async promiseFn={fetchLists} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
          <ListsContainer
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
  );
}
