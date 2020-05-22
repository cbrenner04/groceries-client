import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { EmailField } from '../../components/FormFields';
import axios from '../../utils/api';

function NewPassword(props) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`/auth/password`, {
        email,
        redirect_url: `${process.env.REACT_APP_PUBLIC_URL}/users/password/edit`,
      });
    } catch {
      // TODO: send exception somewhere for logging
    } finally {
      toast(`If ${email} is in our system, you will receive an email shortly with reset instructions.`, {
        type: 'info',
      });
      props.history.push('/users/sign_in');
    }
  };

  return (
    <>
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
