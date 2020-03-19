import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';

import * as config from '../../config/default';
import Alert from '../../components/Alert';
import { EmailField } from '../../components/FormFields';

function NewPassword(props) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors('');
    axios.post(`${config.apiBase}/auth/password`, { email, redirect_url: `${config.rootUrl}/users/password/edit` })
      .then(() => {
        props.history.push('/users/sign_in');
      })
      .catch(() => {
        props.history.push('/users/sign_in');
      });
  };

  return (
    <>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <h2>Forgot your password?</h2>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <EmailField value={email} handleChange={({ target: { value } }) => setEmail(value)} />
        <Button type="submit" variant="success" block>
          Send me reset password instructions
        </Button>
      </Form>
      <Link to="/users/sign_in">Log in</Link>
    </>
  );
}

NewPassword.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default NewPassword;
