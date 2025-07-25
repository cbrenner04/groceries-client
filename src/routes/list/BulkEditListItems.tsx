import React, { type ReactNode } from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useLocation, useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';

import { fetchItemsToEdit, type IFulfilledBulkEditItemsData } from './utils';
import BulkEditListItemsForm from './containers/BulkEditListItemsForm';
import UnknownError from '../error_pages/UnknownError';

const BulkEditListItems: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { list_id: listId } = useParams();
  const location = useLocation();

  return (
    <Async
      promiseFn={fetchItemsToEdit as unknown as PromiseFn<void>}
      list_id={listId}
      search={location.search}
      navigate={navigate}
    >
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledBulkEditItemsData | undefined): ReactNode => {
          // Handle the case where data might be undefined
          /* istanbul ignore else */
          if (!data) {
            return <UnknownError />;
          }

          return (
            <BulkEditListItemsForm
              navigate={navigate}
              list={data.list}
              lists={data.lists}
              items={data.items}
              categories={data.categories}
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

export default BulkEditListItems;
