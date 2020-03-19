import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';

import Alert from '../../components/Alert';
import { EmailField } from '../../components/FormFields';
import { setUserInfo } from '../../utils/auth';

function InviteForm(props) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors('');
    axios.post(`${process.env.REACT_APP_API_BASE}/auth/invitation`, { email }, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ headers }) => {
      setUserInfo(headers);
      props.history.push('/');
    }).catch(({ response, request, message }) => {
      if (response) {
        setUserInfo(response.headers);
        if (response.status === 401) {
          // TODO: how do we pass error messages along?
          props.history.push('/users/sign_in');
        } else if (response.status === 403) {
          // TODO: how do we pass error messages along
          props.history.push('/lists');
        } else {
          const responseTextKeys = Object.keys(response.data);
          const responseErrors = responseTextKeys.map(key => `${key} ${response.data[key]}`);
          setErrors(responseErrors.join(' and '));
        }
      } else if (request) {
        // TODO: what do here?
      } else {
        setErrors(message);
      }
    });
  };

  return (
    <>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <h1>Send Invitation</h1>
      <Link to="/lists" className="float-right">Back to lists</Link>
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
