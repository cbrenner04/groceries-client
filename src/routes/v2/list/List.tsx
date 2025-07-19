import React from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';

import { fetchList, type IFulfilledListData } from './utils';
import ListContainer from './containers/ListContainer';
import UnknownError from '../../error_pages/UnknownError';

const List = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Async promiseFn={fetchList as unknown as PromiseFn<void>} id={id} navigate={navigate}>
      <Async.Pending>
        <Loading />
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
