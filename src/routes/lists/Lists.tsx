import React from 'react';
import Async, { PromiseFn } from 'react-async';
import { useNavigate } from 'react-router-dom';

import { fetchLists } from './utils';
import ListsContainer from './containers/ListsContainer';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';
import { IList, TUserPermissions } from '../../typings';

export default function Lists() {
  const navigate = useNavigate();

  return (
    // TODO: figure out typings for promiseFn
    <Async promiseFn={fetchLists as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: {
          userId: string;
          pendingLists: IList[];
          completedLists: IList[];
          incompleteLists: IList[];
          currentUserPermissions: TUserPermissions;
        }) => (
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
