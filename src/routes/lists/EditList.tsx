import React from 'react';
import Async from 'react-async';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchListToEdit } from './utils';
import EditListForm from './containers/EditListForm';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

export default function EditList(props) {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Async promiseFn={fetchListToEdit} navigate={navigate} id={id}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => <EditListForm listId={data.listId} name={data.name} completed={data.completed} type={data.type} />}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}
