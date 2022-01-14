import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Async from 'react-async';
import { toast } from 'react-toastify';

import { CheckboxField, EmailField, PasswordField } from '../../components/FormFields';
import axios from '../../utils/api';
import Loading from '../../components/Loading';
import FormSubmission from '../../components/FormSubmission';

async function fetchData({ navigate }) {
  try {
    await axios.get(`/auth/validate_token`);
    navigate('/lists');
  } catch {
    // noop. all errors require login
  }
}

function NewSession({ signInUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
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
      } = await axios.post(`/auth/sign_in`, user);
      signInUser(accessToken, client, uid);
      toast(`Welcome ${email}!`, { type: 'info' });
      navigate('/lists');
    } catch {
      toast('Something went wrong. Please check your credentials and try again.', { type: 'error' });
    }
  };

  return (
    <Async promiseFn={fetchData} navigate={navigate}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        <h2>Log in</h2>
        <Form onSubmit={handleSubmit}>
          <EmailField value={email} handleChange={({ target: { value } }) => setEmail(value)} />
          <PasswordField
            name="password"
            label="Password"
            value={password}
            handleChange={({ target: { value } }) => setPassword(value)}
            placeholder="password"
          />
          <CheckboxField
            name="remember-me"
            classes="mb-3"
            label="Remember me"
            value={rememberMe}
            handleChange={() => setRememberMe(!rememberMe)}
          />
          <FormSubmission submitText="Log In" displayCancelButton={false} />
        </Form>
        <Link to="/users/password/new">Forgot your password?</Link>
      </Async.Fulfilled>
    </Async>
  );
}

NewSession.propTypes = {
  signInUser: PropTypes.func.isRequired,
};

export default NewSession;
