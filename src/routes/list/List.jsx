import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import { fetchList } from './utils';
import ListContainer from './containers/ListContainer';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

function List(props) {
  if (!props.match) {
    toast('Something went wrong', { type: 'error' });
    props.history.push('/lists');
    return;
  }

  const listId = props.match.params.id;

  return (
    <Async promiseFn={fetchList} id={listId} history={props.history}>
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
            history={props.history}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}

List.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default List;