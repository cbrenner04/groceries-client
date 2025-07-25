import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';

import { fetchListItemToEdit, type IFulfilledEditListItemData } from './utils';
import EditListItemForm from './containers/EditListItemForm';
import UnknownError from '../error_pages/UnknownError';

const EditListItem: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { list_id: listId, id } = useParams();

  return (
    <Async promiseFn={fetchListItemToEdit as unknown as PromiseFn<void>} navigate={navigate} list_id={listId} id={id}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledEditListItemData | undefined): ReactNode => {
          // Handle the case where data might be undefined
          if (!data) {
            return <UnknownError />;
          }

          return (
            <EditListItemForm
              list={data.list}
              item={data.item}
              listUsers={data.list_users}
              listItemConfiguration={data.list_item_configuration}
              listItemFieldConfigurations={data.list_item_field_configurations}
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

export default EditListItem;
