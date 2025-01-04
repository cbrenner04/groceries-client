import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { type AxiosError } from 'axios';

import { EmailField } from 'components/FormFields';
import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';

const InviteForm: React.FC = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      await axios.post('/auth/invitation', { email });
      toast(`${email} successfully invited`, { type: 'info' });
      navigate('/lists');
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          navigate('/users/sign_in');
        } else {
          const responseTextKeys = Object.keys(error.response.data!);
          const responseErrors = responseTextKeys.map(
            (key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
          );
          toast(responseErrors.join(' and '), { type: 'error' });
        }
      } else if (error.request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(error.message, { type: 'error' });
      }
    }
  };

  return (
    <React.Fragment>
      <h1>Send Invitation</h1>
      <Form onSubmit={handleSubmit} className="mt-3">
        <EmailField
          value={email}
          handleChange={(event: ChangeEvent<HTMLInputElement>): void => setEmail(event.target.value)}
        />
        <FormSubmission
          submitText="Invite User"
          cancelAction={(): void | Promise<void> => navigate('/lists')}
          cancelText="Cancel"
        />
      </Form>
    </React.Fragment>
  );
};

export default InviteForm;
