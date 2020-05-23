import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import axios from 'axios';
import { toast } from 'react-toastify';

import PasswordForm from './components/PasswordForm';

function EditPassword(props) {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // TODO: this doesn't use global instance b/c need to skip the interceptors b/c the headers aren't coming through
      await axios.put(
        `${process.env.REACT_APP_API_BASE}/auth/password`,
        {
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          headers: queryString.parse(props.location.search),
        },
      );
      toast('Password successfully updated', { type: 'info' });
      props.history.push('/users/sign_in');
    } catch ({ response, request, message }) {
      if (response) {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
        toast(responseErrors.join(' and '), { type: 'error' });
      } else if (request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(message, { type: 'error' });
      }
    }
  };

  return (
    <>
      <h2>Change your password</h2>
      <PasswordForm
        password={password}
        passwordChangeHandler={({ target: { value } }) => setPassword(value)}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationChangeHandler={({ target: { value } }) => setPasswordConfirmation(value)}
        submissionHandler={handleSubmit}
      />
      <Link to="/users/sign_in">Log in</Link>
    </>
  );
}

EditPassword.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditPassword;
