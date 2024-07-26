import type { ChangeEvent, FormEvent } from 'react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import PasswordForm from './components/PasswordForm';
import axios from '../../utils/api';

export default function EditPassword() {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      // this doesn't use global instance b/c need to skip the interceptors b/c the headers aren't coming through
      await axios.put(
        `${process.env.REACT_APP_API_BASE}/auth/password`,
        {
          password,
          password_confirmation: passwordConfirmation,
        },
        // {
        //   headers: queryString.parse(location.search),
        // },
      );
      toast('Password successfully updated', { type: 'info' });
      navigate('/users/sign_in');
    } catch (err: any) {
      if (err.response) {
        const responseTextKeys = Object.keys(err.response.data);
        const responseErrors = responseTextKeys.map((key) => `${key} ${err.response.data[key]}`);
        toast(responseErrors.join(' and '), { type: 'error' });
      } else if (err.request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(err.message, { type: 'error' });
      }
    }
  };

  return (
    <>
      <h2>Change your password</h2>
      <PasswordForm
        password={password}
        passwordChangeHandler={({ target: { value } }: ChangeEvent<HTMLInputElement>) => setPassword(value)}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationChangeHandler={({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
          setPasswordConfirmation(value)
        }
        submissionHandler={handleSubmit}
      />
      <Link to="/users/sign_in">Log in</Link>
    </>
  );
}
