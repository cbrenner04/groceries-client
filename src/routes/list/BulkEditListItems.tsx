import React from 'react';
import type { PromiseFn } from 'react-async';
import Async from 'react-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { fetchItemsToEdit } from './utils';
import BulkEditListItemsForm from './containers/BulkEditListItemsForm';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';
import type { IList, IListItem, IListUser } from '../../typings';

const BulkEditListItems: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { list_id: listId } = useParams();
  const location = useLocation();

  return (
    <Async
      // TODO: figure out the `promiseFn` typings
      promiseFn={fetchItemsToEdit as unknown as PromiseFn<void>}
      listId={listId}
      search={location.search}
      navigate={navigate}
    >
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: {
          list: IList;
          lists: IList[];
          items: IListItem[];
          categories: string[];
          list_users: IListUser[];
        }): React.JSX.Element => (
          <BulkEditListItemsForm
            navigate={navigate}
            list={data.list}
            lists={data.lists}
            items={data.items}
            categories={data.categories}
            listUsers={data.list_users}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default BulkEditListItems;
