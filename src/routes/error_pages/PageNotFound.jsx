import React from 'react';
import { Link } from 'react-router-dom';
import Async from 'react-async';
import PropTypes from 'prop-types';

import axios from '../../utils/api';
import Loading from '../../components/Loading';

async function fetchData({ history }) {
  try {
    await axios.get(`/auth/validate_token`);
  } catch ({ response }) {
    if (response) {
      if (response.status === 401) {
        history.push({
          pathname: '/users/sign_in',
          state: { errors: 'You must sign in' },
        });
      } else {
        history.push({
          pathname: '/lists',
          state: { errors: 'Something went wrong' },
        });
      }
    } else {
      history.push({
        pathname: '/lists',
        state: { errors: 'Something went wrong' },
      });
    }
  }
}

function PageNotFound(props) {
  return (
    <Async promiseFn={fetchData} history={props.history}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        <h1>Page not found!</h1>
        <h2>Sorry but the page you are looking for was not found.</h2>
        <Link to="/lists">Return to the home page</Link>
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
