import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { EmailField } from 'components/FormFields';
import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';

const NewPassword: React.FC = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      await axios.post('/auth/password', {
        email,
        redirect_url: `${process.env.REACT_APP_PUBLIC_URL}/users/password/edit`,
      });
    } catch {
      // noop
    } finally {
      toast(`If ${email} is in our system, you will receive an email shortly with reset instructions.`, {
        type: 'info',
      });
      navigate('/users/sign_in');
    }
  };

  return (
    <React.Fragment>
      <h2>Forgot your password?</h2>
      <Form onSubmit={handleSubmit} autoComplete="off">
        <EmailField
          value={email}
          handleChange={(event: ChangeEvent<HTMLInputElement>): void => setEmail(event.target.value)}
        />
        <FormSubmission submitText="Send me reset password instructions" />
      </Form>
      <Link to="/users/sign_in">Log in</Link>
    </React.Fragment>
  );
};

export default NewPassword;
