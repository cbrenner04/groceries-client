import React from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import { Skeleton } from 'components/ui/Skeleton';

import { fetchList, type IFulfilledListData } from './utils';
import ListContainer from './containers/ListContainer';
import UnknownError from '../error_pages/UnknownError';

const List = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Async promiseFn={fetchList as unknown as PromiseFn<void>} id={id} navigate={navigate}>
      <Async.Pending>
        <div
          className={
            'tw:w-full tw:mx-auto tw:max-w-[var(--width-content)] ' +
            'tw:px-[var(--spacing-gutter)] tw:py-4 tw:space-y-2'
          }
        >
          <Skeleton variant="text" width="50%" height="1.5rem" />
          <div className="tw:space-y-3 tw:mt-4">
            <Skeleton variant="list" count={8} />
          </div>
        </div>
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledListData | undefined): React.JSX.Element => {
          // TODO: needed after updates to handleFailure - keep?
          if (!data) {
            return <UnknownError />;
          }
          return (
            <ListContainer
              userId={data.current_user_id}
              list={data.list}
              completedItems={data.completed_items}
              categories={data.categories}
              listUsers={data.list_users}
              notCompletedItems={data.not_completed_items}
              permissions={data.permissions}
              listsToUpdate={data.lists_to_update}
              listItemConfiguration={data.list_item_configuration}
              listItemFieldConfigurations={data.list_item_field_configurations}
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

export default List;
