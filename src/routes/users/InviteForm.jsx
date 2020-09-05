import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { EmailField } from '../../components/FormFields';
import axios from '../../utils/api';

function InviteForm(props) {
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post(`/auth/invitation`, { email });
      toast(`${email} successfully invited`, { type: 'info' });
      props.history.push('/lists');
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.history.push('/users/sign_in');
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
        <Button type="submit" variant="success" block>
          Invite User
        </Button>
        <Button onClick={() => props.history.push('/lists')} variant="link" block>
          Cancel
        </Button>
      </Form>
    </>
  );
}

InviteForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default InviteForm;
