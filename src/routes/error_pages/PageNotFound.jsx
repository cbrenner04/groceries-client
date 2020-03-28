import React from 'react';
import { Link } from 'react-router-dom';
import Async from 'react-async';
import PropTypes from 'prop-types';

import axios from '../../utils/api';

async function fetchData({ history }) {
  try {
    await axios.get(`/auth/validate_token`, { headers: JSON.parse(sessionStorage.getItem('user')) });
    history.push('/lists');
  } catch {
    // noop
  }
}

function PageNotFound(props) {
  return (
    <Async promiseFn={fetchData} history={props.history}>
      <Async.Pending>Loading...</Async.Pending>
      <Async.Fulfilled>
        <h1>Page not found!</h1>
        <h2>Sorry but the page you are looking for was not found.</h2>
        <Link to="/">Return to the home page</Link>
      </Async.Fulfilled>
      {/* This should never render, all errors result in redirect back to /lists */}
      <Async.Rejected>Something went wrong!</Async.Rejected>
    </Async>
  );
}

PageNotFound.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default PageNotFound;
