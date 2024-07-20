import React, { useState } from 'react';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

import PasswordForm from './components/PasswordForm';
import axios from '../../utils/api';

export default function EditInvite() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const user = {
      password,
      password_confirmation: passwordConfirmation,
      invitation_token: queryString.parse(location.search).invitation_token,
    };
    try {
      await axios.put(`/auth/invitation`, user);
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
      <h2>Set your password</h2>
      <PasswordForm
        password={password}
        passwordChangeHandler={({ target: { value } }) => setPassword(value)}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationChangeHandler={({ target: { value } }) => setPasswordConfirmation(value)}
        submissionHandler={handleSubmit}
      />
    </>
  );
}
