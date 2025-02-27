import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';
import type { IListUser, IUsersList } from 'typings';

import ShareListForm from './containers/ShareListForm';
import { fetchData } from './utils';
import UnknownError from '../error_pages/UnknownError';

interface IFulfilledResponse {
  name: string;
  invitableUsers: IListUser[];
  listId: string;
  userIsOwner: boolean;
  pending: IUsersList[];
  accepted: IUsersList[];
  refused: IUsersList[];
  userId: string;
}

const ShareList: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const params = useParams();

  return (
    <Async promiseFn={fetchData as unknown as PromiseFn<void>} listId={params.list_id} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledResponse): ReactNode => (
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
};

export default ShareList;
