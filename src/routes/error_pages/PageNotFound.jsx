import React from 'react';
import { Link } from 'react-router-dom';
import Async from 'react-async';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import axios from '../../utils/api';
import Loading from '../../components/Loading';
import UnknownError from './UnknownError';

async function fetchData({ navigate }) {
  try {
    await axios.get('/auth/validate_token');
  } catch ({ response }) {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        navigate('/users/sign_in');
        return;
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
}

function PageNotFound() {
  const navigate = useNavigate();
  return (
    <Async promiseFn={fetchData} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        <h1>Page not found!</h1>
        <h2>Sorry but the page you are looking for was not found.</h2>
        <Link to="/lists">Return to the home page</Link>
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
}

export default PageNotFound;
