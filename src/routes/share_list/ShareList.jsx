import React from 'react';
import Async from 'react-async';

import ShareListForm from './containers/ShareListForm';
import { fetchData } from './utils';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';
import { useNavigate, useParams } from 'react-router-dom';

export default function ShareList() {
  const navigate = useNavigate();
  const { list_id } = useParams();

  return (
    <Async promiseFn={fetchData} listId={list_id} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
          <ShareListForm
            name={data.name}
            invitableUsers={data.invitableUsers}
            listId={data.listId}
            userIsOwner={data.userIsOwner}
            pending={data.pending}
            accepted={data.accepted}
            refused={data.refused}
            userId={data.userId}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}
