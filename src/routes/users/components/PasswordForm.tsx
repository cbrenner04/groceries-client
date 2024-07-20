import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

import { PasswordField } from '../../../components/FormFields';
import FormSubmission from '../../../components/FormSubmission';

const PasswordForm = (props) => (
  <Form onSubmit={props.submissionHandler} autoComplete="off" data-test-id="password-form">
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
    <FormSubmission submitText="Set my password" displayCancelButton={false} cancelAction={() => undefined} />
  </Form>
);

PasswordForm.propTypes = {
  password: PropTypes.string.isRequired,
  passwordChangeHandler: PropTypes.func.isRequired,
  passwordConfirmation: PropTypes.string.isRequired,
  passwordConfirmationChangeHandler: PropTypes.func.isRequired,
  submissionHandler: PropTypes.func.isRequired,
};

export default PasswordForm;
