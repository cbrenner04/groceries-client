import type { ChangeEventHandler, FormEventHandler } from 'react';
import React from 'react';
import { Form } from 'react-bootstrap';

import { PasswordField } from '../../../components/FormFields';
import FormSubmission from '../../../components/FormSubmission';

interface IPasswordFormProps {
  password: string;
  passwordChangeHandler: ChangeEventHandler;
  passwordConfirmation: string;
  passwordConfirmationChangeHandler: ChangeEventHandler;
  submissionHandler: FormEventHandler;
}

const PasswordForm: React.FC<IPasswordFormProps> = (props) => (
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

export default PasswordForm;
