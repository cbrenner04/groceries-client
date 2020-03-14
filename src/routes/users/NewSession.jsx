import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as $ from 'jquery';
import { Button, Form } from 'react-bootstrap';

import * as config from '../../config/default';
import Alert from '../../components/Alert';
import { CheckboxField, EmailField, PasswordField } from '../../components/FormFields';

export default function NewSession(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState('');

  // TODO: handle redirect if already signed in

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors('');
    const user = {
      email,
      password,
      remember_me: rememberMe,
    };
    $.ajax({
      url: `${config.apiBase}/auth/sign_in`,
      type: 'POST',
      data: user,
    }).done(({ data }, _status, request) => {
      sessionStorage.setItem('user', JSON.stringify({
        'access-token': request.getResponseHeader('access-token'),
        client: request.getResponseHeader('client'),
        uid: data.uid,
      }));
      props.history.push('/');
    }).fail((response) => {
      setErrors(response.responseText);
    });
  };

  return (
    <>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
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
    </>
  );
}
