import React from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchItemToEdit } from './utils';
import EditListItemForm from './containers/EditListItemForm';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';
import type { IList, IListItem, IListUser } from '../../typings';

interface IFetchResponse {
  list: IList;
  item: IListItem;
  listUsers: IListUser[];
  userId: string;
}

const EditListItem: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id, list_id: listId } = useParams();

  return (
    <Async promiseFn={fetchItemToEdit as unknown as PromiseFn<void>} itemId={id} listId={listId} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFetchResponse): React.JSX.Element => (
          <EditListItemForm
            navigate={navigate}
            listUsers={data.listUsers}
            userId={data.userId}
            list={data.list}
            item={data.item}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default EditListItem;
