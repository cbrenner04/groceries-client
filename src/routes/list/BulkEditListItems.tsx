import React from 'react';
import Async from 'react-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { fetchItemsToEdit } from './utils';
import BulkEditListItemsForm from './containers/BulkEditListItemsForm';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

export default function BulkEditListItems() {
  const navigate = useNavigate();
  const { list_id } = useParams();
  const location = useLocation();

  return (
    <Async promiseFn={fetchItemsToEdit} listId={list_id} search={location.search} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
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
}
