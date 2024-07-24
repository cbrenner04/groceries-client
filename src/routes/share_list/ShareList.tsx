import React from 'react';
import Async, { PromiseFn } from 'react-async';

import ShareListForm from './containers/ShareListForm';
import { fetchData } from './utils';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';
import { useNavigate, useParams } from 'react-router-dom';
import { IListUser, IUsersList } from '../../typings';

export default function ShareList() {
  const navigate = useNavigate();
  const { list_id } = useParams();

  return (
    // TODO: figure out typings for PromiseFn
    <Async promiseFn={fetchData as unknown as PromiseFn<void>} listId={list_id} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: {
          name: string;
          invitableUsers: IListUser[];
          listId: string;
          userIsOwner: boolean;
          pending: IUsersList[];
          accepted: IUsersList[];
          refused: IUsersList[];
          userId: string;
        }) => (
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
