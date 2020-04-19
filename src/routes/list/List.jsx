import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import { fetchList } from './utils';
import ListContainer from './containers/ListContainer';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

function List(props) {
  if (!props.match) {
    props.history.push({
      pathname: '/lists',
      state: { errors: 'Something went wrong' },
    });
    return;
  }

  const listId = props.match.params.id;

  let initialErrors = '';
  let initialSuccess = '';
  if (props.location && props.location.state) {
    if (props.location.state.errors) {
      initialErrors = props.location.state.errors;
    } else if (props.location.state.success) {
      initialSuccess = props.location.state.success;
    }
  }

  return (
    <Async promiseFn={fetchList} id={listId} history={props.history}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {data => (
          <ListContainer
            id={listId}
            userId={data.currentUserId}
            list={data.list}
            purchasedItems={data.purchasedItems}
            categories={data.categories}
            listUsers={data.listUsers}
            includedCategories={data.includedCategories}
            notPurchasedItems={data.notPurchasedItems}
            permissions={data.permissions}
            initialErrors={initialErrors}
            initialSuccess={initialSuccess}
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
    push: PropTypes.func,
  }),
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      errors: PropTypes.string,
      success: PropTypes.string,
    }),
  }),
};

export default List;
