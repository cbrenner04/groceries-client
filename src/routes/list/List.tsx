import React from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchList } from './utils';
import ListContainer from './containers/ListContainer';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';
import type { IList, IListItem, IListUser } from '../../typings';

const List = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();

  // TODO: figure out `promiseFn` typings
  return (
    <Async promiseFn={fetchList as unknown as PromiseFn<void>} id={id} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: {
          currentUserId: string;
          list: IList;
          purchasedItems: IListItem[];
          categories: string[];
          listUsers: IListUser[];
          includedCategories: string[];
          notPurchasedItems: Record<string, IListItem[]>;
          permissions: string;
        }): React.JSX.Element => (
          <ListContainer
            userId={data.currentUserId}
            list={data.list}
            purchasedItems={data.purchasedItems}
            categories={data.categories}
            listUsers={data.listUsers}
            includedCategories={data.includedCategories}
            notPurchasedItems={data.notPurchasedItems}
            permissions={data.permissions}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default List;
