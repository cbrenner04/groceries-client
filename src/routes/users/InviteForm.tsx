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

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`/auth/invitation`, { email });
      toast(`${email} successfully invited`, { type: 'info' });
      navigate('/lists');
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          toast('You must sign in', { type: 'error' });
          navigate('/users/sign_in');
        } else {
          const responseTextKeys = Object.keys(response.data);
          const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
          toast(responseErrors.join(' and '), { type: 'error' });
        }
      } else if (request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(message, { type: 'error' });
      }
    }
  };

  return (
    <>
      <h1>Send Invitation</h1>
      <Form onSubmit={handleSubmit} className="mt-3">
        <EmailField value={email} handleChange={({ target: { value } }) => setEmail(value)} />
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
