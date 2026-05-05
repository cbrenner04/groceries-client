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
      await axios.put(`${import.meta.env.VITE_API_BASE}/auth/password`, {
        password,
        password_confirmation: passwordConfirmation,
      });
      showToast.info('Password successfully updated');
      navigate('/users/sign_in');
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        const responseTextKeys = Object.keys((error.response.data ?? {}) as Record<string, unknown>);
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
    <div className="tw:min-h-screen tw:flex tw:items-center tw:justify-center tw:px-4 tw:py-8">
      <div className="tw:w-full tw:max-w-sm tw:bg-[var(--color-surface)] tw:rounded-xl tw:shadow-lg tw:p-6">
        <h1 className="tw:text-xl tw:font-semibold tw:text-center tw:mb-1">Groceries</h1>
        <h2 className="tw:text-lg tw:font-medium tw:text-center tw:mb-6">Change your password</h2>
        <PasswordForm
          password={password}
          passwordChangeHandler={(event: ChangeEvent<HTMLInputElement>): void => setPassword(event.target.value)}
          passwordConfirmation={passwordConfirmation}
          passwordConfirmationChangeHandler={(event: ChangeEvent<HTMLInputElement>): void =>
            setPasswordConfirmation(event.target.value)
          }
          submissionHandler={handleSubmit}
        />
        <div className="tw:mt-4 tw:text-center">
          <Link to="/users/sign_in">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default EditPassword;
