import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import * as $ from 'jquery';
import * as config from '../../config/default';

import Alert from '../../components/Alert';
import { EmailField } from '../../components/FormFields';

function NewPassword(props) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors('');
    const user = { email };
    $.ajax({
      url: `${config.apiBase}/users/password`,
      type: 'POST',
      data: { user },
    }).done(() => {
      // devise returns 200 no matter what is entered. On bad emails we need to redirect to /users/sign_in
      props.history.push('/users/sign_in');
    });
  };

  return (
    <div>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <h2>Forgot your password?</h2>
      <form className="form" onSubmit={handleSubmit} autoComplete="off">
        <EmailField value={email} handleChange={({ target: { value } }) => setEmail(value)} />
        <button type="submit" className="btn btn-success btn-block">
          Send me reset password instructions
        </button>
      </form>
      <Link to="/users/sign_in">Log in</Link>
    </div>
  );
}

NewPassword.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default NewPassword;
