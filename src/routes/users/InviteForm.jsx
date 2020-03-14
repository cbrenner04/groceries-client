import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as $ from 'jquery';
import { Button, Form } from 'react-bootstrap';

import * as config from '../../config/default';
import Alert from '../../components/Alert';
import { EmailField } from '../../components/FormFields';
import { setUserInfo } from '../../utils/auth';

export default function InviteForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors('');
    $.ajax({
      url: `${config.apiBase}/auth/invitation`,
      type: 'POST',
      data: { user: { email } },
      headers: JSON.parse(sessionStorage.getItem('user')),
    })
    .done((_data, _status, request) => {
      setUserInfo(request);
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
