import type { ChangeEvent, FormEvent } from 'react';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { EmailField } from '../../components/FormFields';
import axios from '../../utils/api';
import FormSubmission from '../../components/FormSubmission';

export default function InviteForm() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await axios.post('/auth/invitation', { email });
      toast(`${email} successfully invited`, { type: 'info' });
      navigate('/lists');
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          navigate('/users/sign_in');
        } else {
          const responseTextKeys = Object.keys(err.response.data);
          const responseErrors = responseTextKeys.map((key) => `${key} ${err.response.data[key]}`);
          toast(responseErrors.join(' and '), { type: 'error' });
        }
      } else if (err.request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(err.message, { type: 'error' });
      }
    }
  };

  return (
    <>
      <h1>Send Invitation</h1>
      <Form onSubmit={handleSubmit} className="mt-3">
        <EmailField
          value={email}
          handleChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => setEmail(value)}
        />
        <FormSubmission
          submitText="Invite User"
          cancelAction={() => navigate('/lists')}
          cancelText="Cancel"
          displayCancelButton={true}
        />
      </Form>
    </>
  );
}
