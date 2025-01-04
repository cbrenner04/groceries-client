import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate } from 'react-router';

import Loading from 'components/Loading';
import type { IList, TUserPermissions } from 'typings';

import UnknownError from '../error_pages/UnknownError';
import { fetchCompletedLists } from './utils';
import CompletedListsContainer from './containers/CompletedListsContainer';

const CompletedLists: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    // TODO: figure out typings for promiseFn
    <Async promiseFn={fetchCompletedLists as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: { completedLists: IList[]; currentUserPermissions: TUserPermissions; userId: string }): ReactNode => (
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
