import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import Alert from '../../components/Alert';
import PasswordForm from './components/PasswordForm';
import axios from '../../utils/api';

function EditPassword(props) {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors('');
    try {
      await axios.put(
        `/auth/password`,
        {
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          headers: queryString.parse(props.location.search),
        },
      );
      props.history.push({
        pathname: '/users/sign_in',
        state: { success: 'Password successfully updated' },
      });
    } catch ({ response, request, message }) {
      if (response) {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
        setErrors(responseErrors.join(' and '));
      } else if (request) {
        setErrors('Something went wrong');
      } else {
        setErrors(message);
      }
    }
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
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default EditPassword;
