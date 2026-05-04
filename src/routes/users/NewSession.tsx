import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import Async, { type PromiseFn } from 'react-async';

import { showToast } from '../../utils/toast';

import { CheckboxField, EmailField, PasswordField } from 'components/FormFields';
import axios from 'utils/api';
import Loading from 'components/Loading';
import FormSubmission from 'components/FormSubmission';

async function fetchData(fetchParams: { navigate: (url: string) => void }): Promise<void> {
  try {
    await axios.get('/auth/validate_token');
    fetchParams.navigate('/lists');
  } catch {
    // noop. all errors require login
  }
}

export interface INewSessionProps {
  signInUser: (accessToken: string, client: string, uid: string) => void;
}

const NewSession: React.FC<INewSessionProps> = (props): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const user = {
      email,
      password,
      remember_me: rememberMe,
    };
    try {
      const response = await axios.post('/auth/sign_in', user);
      props.signInUser(response.headers['access-token'], response.headers.client, response.data.data.uid);
      showToast.info(`Welcome ${email}!`);
      navigate('/lists');
    } catch {
      showToast.error('Something went wrong. Please check your credentials and try again.');
    }
  };

  return (
    <Async promiseFn={fetchData as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        <div className="tw:min-h-screen tw:flex tw:items-center tw:justify-center tw:px-4 tw:py-8">
          <div className="tw:w-full tw:max-w-sm tw:bg-[var(--color-surface)] tw:rounded-xl tw:shadow-lg tw:p-6">
            <h1 className="tw:text-xl tw:font-semibold tw:text-center tw:mb-1">Groceries</h1>
            <h2 className="tw:text-lg tw:font-medium tw:text-center tw:mb-6">Log in</h2>
            <form onSubmit={handleSubmit}>
              <EmailField
                value={email}
                handleChange={(event: ChangeEvent<HTMLInputElement>): void => setEmail(event.target.value)}
              />
              <PasswordField
                name="password"
                label="Password"
                value={password}
                handleChange={(event: ChangeEvent<HTMLInputElement>): void => setPassword(event.target.value)}
                placeholder="password"
              />
              <CheckboxField
                name="remember-me"
                classes="tw:mb-3"
                label="Remember me"
                value={rememberMe}
                handleChange={(): void => setRememberMe(!rememberMe)}
              />
              <FormSubmission submitText="Log In" />
            </form>
            <div className="tw:mt-4 tw:text-center">
              <Link to="/users/password/new">Forgot your password?</Link>
            </div>
          </div>
        </div>
      </Async.Fulfilled>
    </Async>
  );
};

export default NewSession;
