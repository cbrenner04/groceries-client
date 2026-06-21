import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate } from 'react-router';

import { Skeleton } from 'components/ui/Skeleton';
import type { IList, IListItemConfiguration, TUserPermissions } from 'typings';

import { fetchLists } from './utils';
import ListsContainer from './containers/ListsContainer';
import UnknownError from '../error_pages/UnknownError';
import { PageLayout } from 'components/layout/PageLayout';

interface IFulfilledLists {
  userId: string;
  pendingLists: IList[];
  completedLists: IList[];
  incompleteLists: IList[];
  currentUserPermissions: TUserPermissions;
  listItemConfigurations: IListItemConfiguration[];
}

interface IListsProps {
  initialFilter?: 'all' | 'pending' | 'active' | 'completed';
  initialEditListId?: string | null;
}

const Lists: React.FC<IListsProps> = (props): React.JSX.Element => {
  const navigate = useNavigate();

  return (
    <Async promiseFn={fetchLists as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <div className="tw:p-4 tw:space-y-3">
          <Skeleton variant="card" count={4} />
        </div>
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledLists | undefined): ReactNode => {
          // Handle the case where data might be undefined (e.g., when fetchLists returns undefined due to an error)
          if (!data) {
            return <UnknownError />;
          }

          return (
            <PageLayout>
              <ListsContainer
                userId={data.userId}
                pendingLists={data.pendingLists}
                completedLists={data.completedLists}
                incompleteLists={data.incompleteLists}
                currentUserPermissions={data.currentUserPermissions}
                listItemConfigurations={data.listItemConfigurations}
                initialFilter={props.initialFilter}
                initialEditListId={props.initialEditListId ?? null}
              />
            </PageLayout>
          );
        }}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default Lists;
