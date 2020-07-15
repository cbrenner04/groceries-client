import React from 'react';
import PropTypes from 'prop-types';
import Async from 'react-async';

import BulkEditListItemsForm from './containers/BulkEditListItemsForm';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';
import axios from '../../utils/api';

function BulkEditListItems(props) {
  const fetchItemsToEdit = async ({ listId, itemType, history }) => {
    const { data } = await axios.get(`/lists/${listId}/${itemType}/bulk_update${props.location.search}`);
    return data;
  };
  return (
    <Async
      promiseFn={fetchItemsToEdit}
      listId={props.match.params.list_id}
      itemType={props.match.params[0]}
      history={props.history}
    >
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
          <BulkEditListItemsForm
            history={props.history}
            list={data.list}
            lists={data.lists}
            items={data.items}
            categories={data.categories}
            listUsers={data.list_users}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}

BulkEditListItems.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      list_id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default BulkEditListItems;
