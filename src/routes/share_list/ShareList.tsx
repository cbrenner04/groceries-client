import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';

import ListContainer from '../list/containers/ListContainer';
import { fetchList, type IFulfilledListData } from '../list/utils';
import UnknownError from '../error_pages/UnknownError';

const ShareList: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { list_id: listId } = useParams();

  return (
    <Async promiseFn={fetchList as unknown as PromiseFn<void>} navigate={navigate} id={listId}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledListData | undefined): ReactNode => {
          if (!data) {
            return <UnknownError />;
          }
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
              initialShareSheetOpen
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

export default ShareList;
