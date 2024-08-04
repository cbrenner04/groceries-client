import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from 'utils/api';

import PasswordForm from './components/PasswordForm';

const EditPassword: React.FC = (): React.JSX.Element => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      // this doesn't use global instance b/c need to skip the interceptors b/c the headers aren't coming through
      await axios.put(
        `${process.env.REACT_APP_API_BASE}/auth/password`,
        {
          password,
          password_confirmation: passwordConfirmation,
        },
        // TODO: is this needed? it kinda doesn't make sense
        // {
        //   headers: queryString.parse(location.search),
        // },
      );
      toast('Password successfully updated', { type: 'info' });
      navigate('/users/sign_in');
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        const responseTextKeys = Object.keys(error.response.data!);
        const responseErrors = responseTextKeys.map(
          (key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
        );
        toast(responseErrors.join(' and '), { type: 'error' });
      } else if (error.request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(error.message, { type: 'error' });
      }
    }
  };

  return (
    <React.Fragment>
      <h2>Change your password</h2>
      <PasswordForm
        password={password}
        passwordChangeHandler={(event: ChangeEvent<HTMLInputElement>): void => setPassword(event.target.value)}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationChangeHandler={(event: ChangeEvent<HTMLInputElement>): void =>
          setPasswordConfirmation(event.target.value)
        }
        submissionHandler={handleSubmit}
      />
      <Link to="/users/sign_in">Log in</Link>
    </React.Fragment>
  );
};

export default EditPassword;
