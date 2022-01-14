import React from 'react';
import Async from 'react-async';
import { useNavigate } from 'react-router-dom';

import UnknownError from '../error_pages/UnknownError';
import { fetchCompletedLists } from './utils';
import CompletedListsContainer from './containers/CompletedListsContainer';
import Loading from '../../components/Loading';

export default function CompletedLists() {
  const navigate = useNavigate();

  return (
    <Async promiseFn={fetchCompletedLists} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
          <CompletedListsContainer
            completedLists={data.completedLists}
            currentUserPermissions={data.currentUserPermissions}
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
