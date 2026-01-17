import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { type AxiosError } from 'axios';

import { showToast } from '../../utils/toast';

import axios from 'utils/api';

import PasswordForm from './components/PasswordForm';

const EditPassword: React.FC = (): React.JSX.Element => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE}/auth/password`, {
        password,
        password_confirmation: passwordConfirmation,
      });
      showToast.info('Password successfully updated');
      navigate('/users/sign_in');
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        const responseTextKeys = Object.keys(error.response.data!);
        const responseErrors = responseTextKeys.map(
          (key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
        );
        showToast.error(responseErrors.join(' and '));
      } else if (error.request) {
        showToast.error('Something went wrong');
      } else {
        showToast.error(error.message);
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
