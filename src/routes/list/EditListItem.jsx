import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import { fetchItemToEdit } from './utils';
import EditListItemForm from './containers/EditListItemForm';
import Loading from '../../components/Loading';

function EditListItem(props) {
  return (
    <Async
      promiseFn={fetchItemToEdit}
      itemId={props.match.params.id}
      listId={props.match.params.list_id}
      itemType={props.match.params[0]}
      history={props.history}
    >
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {data => (
          <EditListItemForm
            history={props.history}
            listUsers={data.listUsers}
            userId={data.userId}
            list={data.list}
            item={data.item}
          />
        )}
      </Async.Fulfilled>
      {/* This should never render, all errors result in redirect back to /lists */}
      <Async.Rejected>Something went wrong!</Async.Rejected>
    </Async>
  );
}

EditListItem.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      list_id: PropTypes.string,
    }),
  }),
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default EditListItem;
