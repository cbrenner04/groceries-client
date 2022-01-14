import React from 'react';
import Async from 'react-async';
import { useNavigate, useParams } from 'react-router-dom';

import { fetchList } from './utils';
import ListContainer from './containers/ListContainer';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

function List() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Async promiseFn={fetchList} id={id} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
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
}

export default List;
