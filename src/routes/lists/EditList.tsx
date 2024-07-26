import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router-dom';

import Loading from 'components/Loading';

import { fetchListToEdit } from './utils';
import EditListForm from './containers/EditListForm';
import UnknownError from '../error_pages/UnknownError';

const EditList: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    // TODO: figure out typings for PromiseFn
    <Async promiseFn={fetchListToEdit as unknown as PromiseFn<void>} navigate={navigate} id={id}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: { listId: string; name: string; type: string; completed: boolean }): ReactNode => (
          <EditListForm listId={data.listId} name={data.name} completed={data.completed} type={data.type} />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default EditList;
