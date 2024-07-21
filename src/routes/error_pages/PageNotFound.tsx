import React from 'react';
import { Link, NavigateFunction } from 'react-router-dom';
import Async, { PromiseFn } from 'react-async';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import axios from '../../utils/api';
import Loading from '../../components/Loading';
import UnknownError from './UnknownError';

const fetchData = async ({ navigate }: { navigate: NavigateFunction }) => {
  try {
    await axios.get('/auth/validate_token');
  } catch ({ response }: any) {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        navigate('/users/sign_in');
      }
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error();
  }
};

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    // TODO: figure out typing here
    <Async promiseFn={fetchData as unknown as PromiseFn<void>} navigate={navigate}>
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
};

export default PageNotFound;
