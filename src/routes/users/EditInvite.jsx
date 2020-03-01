import React, { useState } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import * as $ from 'jquery';
import * as config from '../../config/default';

import Alert from '../../components/Alert';
import PasswordForm from './components/PasswordForm';

function EditInvite(props) {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, , setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors('');
    const user = {
      password,
      password_confirmation: passwordConfirmation,
      invitation_token: queryString.parse(props.location.search).invitation_token,
    };
    $.ajax({
      url: `${config.apiBase}/users/invitation`,
      data: { user },
      method: 'PUT',
    }).done((_data, _status, request) => {
      // noop
    }).fail((response) => {
      const responseJSON = JSON.parse(response.responseText);
      const responseErrors = Object.keys(responseJSON).map(key => `${key} ${responseJSON[key]}`);
      setErrors(responseErrors);
    });
  };

  return (
    <div>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <h2>Set your password</h2>
      <PasswordForm
        password={password}
        passwordChangeHandler={({ target: { value } }) => setPassword(value)}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationChangeHandler={({ target: { value } }) => setPasswordConfirmation(value)}
        submissionHandler={handleSubmit}
      />
    </div>
  );
}

EditInvite.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
};

export default EditInvite;
