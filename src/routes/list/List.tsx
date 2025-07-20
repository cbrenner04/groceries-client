import React from 'react';
import Async, { type PromiseFn } from 'react-async';
import { useNavigate, useParams } from 'react-router';

import Loading from 'components/Loading';
import type { IList, IListItem, IListUser } from 'typings';

import { fetchList } from './utils';
import ListContainer from './containers/ListContainer';
import UnknownError from '../error_pages/UnknownError';

interface IFulfilledData {
  currentUserId: string;
  list: IList;
  purchasedItems: IListItem[];
  categories: string[];
  listUsers: IListUser[];
  includedCategories: string[];
  notPurchasedItems: Record<string, IListItem[]>;
  permissions: string;
  lists: IList[];
}

const List = (): React.JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Async promiseFn={fetchList as unknown as PromiseFn<void>} id={id} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data: IFulfilledData): React.JSX.Element => (
          <ListContainer
            userId={data.currentUserId}
            list={data.list}
            purchasedItems={data.purchasedItems}
            categories={data.categories}
            listUsers={data.listUsers}
            includedCategories={data.includedCategories}
            notPurchasedItems={data.notPurchasedItems}
            permissions={data.permissions}
            lists={data.lists}
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
