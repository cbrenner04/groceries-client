import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import * as $ from 'jquery';
import { Button, Form } from 'react-bootstrap';

import * as config from '../../config/default';
import Alert from '../../components/Alert';
import { EmailField } from '../../components/FormFields';
import { setUserInfo } from '../../utils/auth';

function InviteForm(props) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors('');
    $.ajax({
      url: `${config.apiBase}/auth/invitation`,
      type: 'POST',
      data: { email },
      headers: JSON.parse(sessionStorage.getItem('user')),
    })
    .done((_data, _status, request) => {
      setUserInfo(request);
      props.history.push('/');
    })
    .fail((response) => {
      const responseJSON = JSON.parse(response.responseText);
      const responseTextKeys = Object.keys(responseJSON);
      const responseErrors = responseTextKeys.map(key => `${key} ${responseJSON[key].join(' and ')}`);
      setErrors(responseErrors.join(' and '));
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
