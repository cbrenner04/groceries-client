import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import axios from 'axios';

import * as config from '../../config/default';
import Alert from '../../components/Alert';
import PasswordForm from './components/PasswordForm';

function EditPassword(props) {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors('');
    axios.put(`${config.apiBase}/auth/password`, {
      password,
      password_confirmation: passwordConfirmation,
    }, {
      headers: queryString.parse(props.location.search),
    }).then(() => {
      props.history.push('/');
    }).catch(({ response, request, message }) => {
      if (response) {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map(key => `${key} ${response.data[key]}`);
        setErrors(responseErrors.join(' and '));
      } else if (request) {
        // TODO: what do here?
      } else {
        setErrors(message);
      }
    });
  };

  return (
    <>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
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
};

export default EditPassword;
