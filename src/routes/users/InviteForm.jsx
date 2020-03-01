import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import * as $ from 'jquery';

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
      url: `${config.apiBase}/users/invitation`,
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
    <div>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <h1>Send Invitation</h1>
      <Link to="/lists" className="pull-right">Back to lists</Link>
      <br />
      <form onSubmit={handleSubmit}>
        <EmailField value={email} handleChange={({ target: { value } }) => setEmail(value)} />
        <button type="submit" className="btn btn-success btn-block">
          Invite User
        </button>
      </form>
    </div>
  );
}
