import React from 'react';
import Async from 'react-async';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchItemToEdit } from './utils';
import EditListItemForm from './containers/EditListItemForm';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

function EditListItem() {
  const navigate = useNavigate();
  const { id, list_id } = useParams();

  return (
    <Async promiseFn={fetchItemToEdit} itemId={id} listId={list_id} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
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
}

export default EditListItem;
