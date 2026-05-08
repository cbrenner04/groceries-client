import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';

import { fetchList, type IFulfilledListData } from './utils';
import ListContainer from './containers/ListContainer';
import UnknownError from '../error_pages/UnknownError';

const BulkEditListItems: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { list_id: listId } = useParams();

  // This route now renders the list page with the bulk edit sheet pre-opened
  return (
    <Async promiseFn={fetchList as unknown as PromiseFn<void>} navigate={navigate} id={listId}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledListData | undefined): ReactNode => {
          // Handle the case where data might be undefined
          if (!data) {
            return <UnknownError />;
          }

          // Render the list page with bulkEditOpen prop set
          return (
            <ListContainer
              userId={data.current_user_id}
              list={data.list}
              categories={data.categories}
              completedItems={data.completed_items}
              listUsers={data.list_users}
              notCompletedItems={data.not_completed_items}
              permissions={data.permissions}
              listsToUpdate={data.lists_to_update}
              listItemConfiguration={data.list_item_configuration}
              listItemFieldConfigurations={data.list_item_field_configurations}
              initialBulkEditOpen={true}
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

export default BulkEditListItems;
