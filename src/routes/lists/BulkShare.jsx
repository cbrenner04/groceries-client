import React from 'react';
import Async from 'react-async';
import PropTypes from 'prop-types';

import UnknownError from '../error_pages/UnknownError';
// import { fetchListsForBulkShare } from './utils';
// import BulkShareContainer from './containers/BulkShareContainer';
import Loading from '../../components/Loading';

import axios from '../../utils/api';

const fetchListsForBulkShare = async ({ search, history }) => {
  console.log(search); //eslint-disable-line
  const { data } = await axios.get(`/lists/bulk_share${search}`);
  return data;
};

function BulkShare(props) {
  return (
    <Async promiseFn={fetchListsForBulkShare} search={props.location.search} history={props.history}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>{(data) => data.map((list) => <div key={list.id}>{list.name}</div>)}</Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}

BulkShare.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};

export default BulkShare;
