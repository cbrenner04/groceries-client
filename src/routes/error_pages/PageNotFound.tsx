import React from 'react';
import { Link, useNavigate, type NavigateFunction } from 'react-router';
import Async, { type PromiseFn } from 'react-async';
import type { AxiosError } from 'axios';

import { showToast } from '../../utils/toast';

import axios from 'utils/api';
import Loading from 'components/Loading';
import { EmptyState } from 'components/domain/EmptyState';
import { PageLayout } from 'components/layout/PageLayout';
import { QuestionCircleIcon } from 'components/icons';

import UnknownError from './UnknownError';

const fetchData = async (fetchParams: { navigate: NavigateFunction }): Promise<void> => {
  try {
    await axios.get('/auth/validate_token');
  } catch (err: unknown) {
    if ((err as AxiosError).response?.status === 401) {
      showToast.error('You must sign in');
      fetchParams.navigate('/users/sign_in');
    }
    // any other errors will just be caught and render the generic UnknownError
    throw new Error('Token validation failed', { cause: err });
  }
};

const PageNotFound: React.FC = (): React.JSX.Element => {
  const navigate = useNavigate();
  return (
    <Async promiseFn={fetchData as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        <PageLayout>
          <EmptyState
            icon={<QuestionCircleIcon size="3x" />}
            title="Page not found!"
            description="The page you're looking for doesn't exist."
            action={{ label: 'Go to Lists', onClick: (): void => void navigate('/lists') }}
          />
          <div className="tw:text-center">
            <Link to="/lists">Return to the home page</Link>
          </div>
        </PageLayout>
      </Async.Fulfilled>
      <Async.Rejected>
        <UnknownError />
      </Async.Rejected>
    </Async>
  );
};

export default PageNotFound;
