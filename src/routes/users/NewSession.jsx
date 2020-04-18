import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import Async from 'react-async';

import Alert from '../../components/Alert';
import { CheckboxField, EmailField, PasswordField } from '../../components/FormFields';
import axios from '../../utils/api';
import Loading from '../../components/Loading';

async function fetchData({ history }) {
  try {
    await axios.get(`/auth/validate_token`);
    history.push('/lists');
  } catch {
    // TODO: send exception somewhere for logging
  }
}

function NewSession(props) {
  let initialErrors = '';
  let initialSuccess = '';
  if (props.location && props.location.state) {
    if (props.location.state.errors) {
      initialErrors = props.location.state.errors;
    } else if (props.location.state.success) {
      initialSuccess = props.location.state.success;
    }
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState(initialErrors);
  const [success, setSuccess] = useState(initialSuccess);

  useEffect(() => {
    // remove the location state
    props.history.replace(props.history.location.pathname, null);
  }, [props.history, props.history.location.pathname]);

  const handleSubmit = async event => {
    event.preventDefault();
    setErrors('');
    const user = {
      email,
      password,
      remember_me: rememberMe,
    };
    try {
      const {
        data: { data },
        headers,
      } = await axios.post(`/auth/sign_in`, user);
      sessionStorage.setItem(
        'user',
        JSON.stringify({
          'access-token': headers['access-token'],
          client: headers['client'],
          uid: data.uid,
        }),
      );
      props.history.push({
        pathname: '/lists',
        state: { success: `Welcome ${email}!` },
      });
    } catch ({ response, request, message }) {
      if (response) {
        setErrors(response.data.errors[0]);
      } else if (request) {
        setErrors('Something went wrong');
      } else {
        setErrors(message);
      }
    }
  };

  const alertDismiss = () => {
    setErrors('');
    setSuccess('');
  };

  return (
    <Async promiseFn={fetchData} history={props.history}>
      <Async.Pending>
        <Loading />
      </Async.Pending>
      <Async.Fulfilled>
        <Alert errors={errors} success={success} handleDismiss={alertDismiss} />
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
          <Button type="submit" variant="success" block>
            Log in
          </Button>
        </Form>
        <Link to="/users/password/new">Forgot your password?</Link>
      </Async.Fulfilled>
      {/* This should never render, all errors result in redirect back to /lists */}
      <Async.Rejected>Something went wrong!</Async.Rejected>
    </Async>
  );
}

NewSession.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
    replace: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
  }),
  location: PropTypes.shape({
    state: PropTypes.shape({
      errors: PropTypes.string,
      success: PropTypes.string,
    }),
  }),
};

export default NewSession;
