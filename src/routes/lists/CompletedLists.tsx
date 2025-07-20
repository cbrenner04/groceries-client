import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate } from 'react-router';

import Loading from 'components/Loading';
import type { IList, TUserPermissions } from 'typings';

import UnknownError from '../error_pages/UnknownError';
import { fetchCompletedLists } from '../v2/list/utils';
import CompletedListsContainer from './containers/CompletedListsContainer';

interface ICompletedListsData {
  completedLists: IList[];
  currentUserPermissions: TUserPermissions;
  userId: string;
}

const CompletedLists: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    // TODO: figure out typings for promiseFn
    <Async promiseFn={fetchCompletedLists as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: ICompletedListsData | undefined): ReactNode => {
          // Handle the case where data might be undefined (e.g., when fetchCompletedLists returns
          // undefined due to an error)
          if (!data) {
            return <UnknownError />;
          }

          return (
            <CompletedListsContainer
              completedLists={data.completedLists}
              currentUserPermissions={data.currentUserPermissions}
              userId={data.userId}
            />
          );
        }}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default CompletedLists;
