import type { ChangeEvent, FormEvent } from 'react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import type { PromiseFn } from 'react-async';
import Async from 'react-async';
import { toast } from 'react-toastify';

import { CheckboxField, EmailField, PasswordField } from '../../components/FormFields';
import axios from '../../utils/api';
import Loading from '../../components/Loading';
import FormSubmission from '../../components/FormSubmission';

async function fetchData({ navigate }: { navigate: (url: string) => void }) {
  try {
    await axios.get('/auth/validate_token');
    navigate('/lists');
  } catch {
    // noop. all errors require login
  }
}

interface INewSessionProps {
  signInUser: (accessToken: string, client: string, uid: string) => void;
}

const NewSession: React.FC<INewSessionProps> = ({ signInUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = {
      email,
      password,
      remember_me: rememberMe,
    };
    try {
      const {
        data: {
          data: { uid },
        },
        headers: { 'access-token': accessToken, client },
      } = await axios.post('/auth/sign_in', user);
      signInUser(accessToken, client, uid);
      toast(`Welcome ${email}!`, { type: 'info' });
      navigate('/lists');
    } catch {
      toast('Something went wrong. Please check your credentials and try again.', { type: 'error' });
    }
  };

  return (
    // TODO: figure out typings for promiseFn
    <Async promiseFn={fetchData as unknown as PromiseFn<void>} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        <h2>Log in</h2>
        <Form onSubmit={handleSubmit}>
          <EmailField
            value={email}
            handleChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => setEmail(value)}
          />
          <PasswordField
            name="password"
            label="Password"
            value={password}
            handleChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => setPassword(value)}
            placeholder="password"
          />
          <CheckboxField
            name="remember-me"
            classes="mb-3"
            label="Remember me"
            value={rememberMe}
            handleChange={() => setRememberMe(!rememberMe)}
          />
          <FormSubmission submitText="Log In" displayCancelButton={false} cancelAction={() => undefined} />
        </Form>
        <Link to="/users/password/new">Forgot your password?</Link>
      </Async.Fulfilled>
    </Async>
  );
};

export default NewSession;
