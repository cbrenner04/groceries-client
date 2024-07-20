import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import axios from 'axios';
import { toast } from 'react-toastify';

import PasswordForm from './components/PasswordForm';

export default function EditPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // this doesn't use global instance b/c need to skip the interceptors b/c the headers aren't coming through
      await axios.put(
        `${process.env.REACT_APP_API_BASE}/auth/password`,
        {
          password,
          password_confirmation: passwordConfirmation,
        },
        {
          headers: queryString.parse(location.search),
        },
      );
      toast('Password successfully updated', { type: 'info' });
      navigate('/users/sign_in');
    } catch ({ response, request, message }) {
      if (response) {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
        toast(responseErrors.join(' and '), { type: 'error' });
      } else if (request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(message, { type: 'error' });
      }
    }
  };

  return (
    <>
      <h2>Change your password</h2>
      <PasswordForm
        password={password}
        passwordChangeHandler={({ target: { value } }) => setPassword(value)}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationChangeHandler={({ target: { value } }) => setPasswordConfirmation(value)}
        submissionHandler={handleSubmit}
      />
      <Link to="/users/sign_in">Log in</Link>
    </>
  );
}
