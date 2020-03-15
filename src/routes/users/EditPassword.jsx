import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import * as $ from 'jquery';

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
    $.ajax({
      url: `${config.apiBase}/auth/password`,
      data: {
        password,
        password_confirmation: passwordConfirmation,
      },
      method: 'PUT',
      headers: queryString.parse(props.location.search),
    }).done((_data, _status, request) => {
      props.history.push('/');
    }).fail((response) => {
      const responseJSON = JSON.parse(response.responseText);
      const responseTextKeys = Object.keys(responseJSON);
      const responseErrors = responseTextKeys.map(key => `${key} ${responseJSON[key]}`);
      setErrors(responseErrors.join(' and '));
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
