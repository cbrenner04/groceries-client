import React from 'react';
import Async, { PromiseFn } from 'react-async';
import { useNavigate } from 'react-router-dom';

import UnknownError from '../error_pages/UnknownError';
import { fetchCompletedLists } from './utils';
import CompletedListsContainer from './containers/CompletedListsContainer';
import Loading from '../../components/Loading';
import { IList, TUserPermissions } from '../../typings';

const CompletedLists: React.FC = () => {
  const navigate = useNavigate();

  return (
    // TODO: figure out typings for promiseFn
    <Async promiseFn={fetchCompletedLists as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: { completedLists: IList[]; currentUserPermissions: TUserPermissions; userId: string }) => (
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
};

export default CompletedLists;
