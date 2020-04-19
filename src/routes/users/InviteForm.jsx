import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';

import Alert from '../../components/Alert';
import { EmailField } from '../../components/FormFields';
import axios from '../../utils/api';

function InviteForm(props) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors('');
    try {
      await axios.post(`/auth/invitation`, { email });
      props.history.push({
        pathname: '/lists',
        state: { success: `${email} successfully invited` },
      });
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          props.history.push({
            pathname: '/users/sign_in',
            state: { errors: 'You must sign in' },
          });
        } else {
          const responseTextKeys = Object.keys(response.data);
          const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
          setErrors(responseErrors.join(' and '));
        }
      } else if (request) {
        setErrors('Something went wrong');
      } else {
        setErrors(message);
      }
    }
  };

  return (
    <>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <h1>Send Invitation</h1>
      <Link to="/lists" className="float-right">
        Back to lists
      </Link>
      <br />
      <Form onSubmit={handleSubmit}>
        <EmailField value={email} handleChange={({ target: { value } }) => setEmail(value)} />
        <Button type="submit" variant="success" block>
          Invite User
        </Button>
      </Form>
    </>
  );
}

InviteForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
};

export default InviteForm;
