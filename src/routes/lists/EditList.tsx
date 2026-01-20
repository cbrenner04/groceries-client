import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';

import { fetchListToEdit } from './utils';
import EditListForm from './containers/EditListForm';
import UnknownError from '../error_pages/UnknownError';

interface IEditListData {
  listId: string;
  name: string;
  completed: boolean;
}

const EditList: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Async promiseFn={fetchListToEdit as unknown as PromiseFn<void>} navigate={navigate} id={id}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IEditListData | undefined): ReactNode => {
          // Handle the case where data might be undefined
          if (!data) {
            return <UnknownError />;
          }

          return <EditListForm listId={data.listId} name={data.name} completed={data.completed} />;
        }}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default EditList;
