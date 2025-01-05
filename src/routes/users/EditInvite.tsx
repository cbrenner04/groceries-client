import React, { type FormEvent, type ChangeEvent, useState } from 'react';
import queryString from 'query-string';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router';
import { type AxiosError } from 'axios';

import axios from 'utils/api';

import PasswordForm from './components/PasswordForm';

const EditInvite: React.FC = (): React.JSX.Element => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const user = {
      password,
      password_confirmation: passwordConfirmation,
      invitation_token: queryString.parse(location.search).invitation_token,
    };
    try {
      await axios.put('/auth/invitation', user);
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
      <h2>Set your password</h2>
      <PasswordForm
        password={password}
        passwordChangeHandler={(event: ChangeEvent<HTMLInputElement>): void => setPassword(event.target.value)}
        passwordConfirmation={passwordConfirmation}
        passwordConfirmationChangeHandler={(event: ChangeEvent<HTMLInputElement>): void =>
          setPasswordConfirmation(event.target.value)
        }
        submissionHandler={handleSubmit}
      />
    </React.Fragment>
  );
};

export default EditInvite;
