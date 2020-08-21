import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import { fetchItemToEdit } from './utils';
import EditListItemForm from './containers/EditListItemForm';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

function EditListItem(props) {
  return (
    <Async
      promiseFn={fetchItemToEdit}
      itemId={props.match.params.id}
      listId={props.match.params.list_id}
      history={props.history}
    >
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
          <EditListItemForm
            history={props.history}
            listUsers={data.listUsers}
            userId={data.userId}
            list={data.list}
            item={data.item}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}

EditListItem.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      list_id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditListItem;
