import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import { fetchListToEdit } from './utils';
import EditListForm from './containers/EditListForm';
import Loading from '../../components/Loading';
import UnknownError from '../error_pages/UnknownError';

function EditList(props) {
  return (
    <Async promiseFn={fetchListToEdit} history={props.history} id={props.match.params.id}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        {(data) => (
          <EditListForm
            history={props.history}
            listId={data.listId}
            name={data.name}
            completed={data.completed}
            type={data.type}
          />
        )}
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}

EditList.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditList;
