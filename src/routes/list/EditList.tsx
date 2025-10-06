import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';

import { fetchListToEdit, type IFulfilledEditListData } from './utils';
import EditListForm from './containers/LazyEditListForm';
import UnknownError from '../error_pages/UnknownError';

const EditList: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Async promiseFn={fetchListToEdit as unknown as PromiseFn<void>} navigate={navigate} id={id}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledEditListData | undefined): ReactNode => {
          // Handle the case where data might be undefined
          if (!data) {
            return <UnknownError />;
          }

          return (
            <EditListForm
              listId={data.id}
              name={data.name}
              completed={data.completed}
              type={data.type}
              archivedAt={data.archived_at}
              refreshed={data.refreshed}
              listItemConfigurationId={data.list_item_configuration_id}
            />
          );
        }}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default EditList;
