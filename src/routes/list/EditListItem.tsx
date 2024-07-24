import React from 'react';
import Async, { PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchItemToEdit } from './utils';
import EditListItemForm from './containers/EditListItemForm';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';
import { IList, IListItem, IListUser } from '../../typings';

const EditListItem: React.FC = () => {
  const navigate = useNavigate();
  const { id, list_id } = useParams();

  // TODO: figure out `promiseFn` typings
  return (
    <Async promiseFn={fetchItemToEdit as unknown as PromiseFn<void>} itemId={id} listId={list_id} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: { list: IList; item: IListItem; listUsers: IListUser[]; userId: string }) => (
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
