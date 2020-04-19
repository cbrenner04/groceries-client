import React, { useState } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import Alert from '../../components/Alert';
import PasswordForm from './components/PasswordForm';
import axios from '../../utils/api';

function EditInvite(props) {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors('');
    const user = {
      password,
      password_confirmation: passwordConfirmation,
      invitation_token: queryString.parse(props.location.search).invitation_token,
    };
    try {
      await axios.put(`/auth/invitation`, user);
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
      <h2>Set your password</h2>
      <PasswordForm
        password={password}
        passwordChangeHandler={({ target: { value } }) => setPassword(value)}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationChangeHandler={({ target: { value } }) => setPasswordConfirmation(value)}
        submissionHandler={handleSubmit}
      />
    </>
  );
}

EditInvite.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
};

export default EditInvite;
