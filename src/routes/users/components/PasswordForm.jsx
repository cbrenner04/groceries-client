import React from 'react';
import PropTypes from 'prop-types';

import { PasswordField } from '../../../components/FormFields';

const PasswordForm = props => (
  <form className="form" onSubmit={props.submissionHandler} autoComplete="off">
    <PasswordField
      name="password"
      label="Password"
      value={props.password}
      handleChange={props.passwordChangeHandler}
      placeholder="New password"
    />
    <PasswordField
      name="password-confirmation"
      label="Password confirmation"
      value={props.passwordConfirmation}
      handleChange={props.passwordConfirmationChangeHandler}
      placeholder="Confirm new password"
    />
    <button type="submit" className="btn btn-success btn-block">
      Set my password
    </button>
  </form>
);

PasswordForm.propTypes = {
  password: PropTypes.string.isRequired,
  passwordChangeHandler: PropTypes.func.isRequired,
  passwordConfirmation: PropTypes.string.isRequired,
  passwordConfirmationChangeHandler: PropTypes.func.isRequired,
  submissionHandler: PropTypes.func.isRequired,
};

export default PasswordForm;
