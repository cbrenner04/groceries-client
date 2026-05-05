import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { showToast } from '../../utils/toast';

import { EmailField } from 'components/FormFields';
import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';

const NewPassword: React.FC = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      await axios.post('/auth/password', {
        email,
        redirect_url: `${import.meta.env.VITE_PUBLIC_URL}/users/password/edit`,
      });
    } catch {
      // noop
    } finally {
      showToast.info(`If ${email} is in our system, you will receive an email shortly with reset instructions.`);
      navigate('/users/sign_in');
    }
  };

  return (
    <div className="tw:min-h-screen tw:flex tw:items-center tw:justify-center tw:px-4 tw:py-8">
      <div className="tw:w-full tw:max-w-sm tw:bg-[var(--color-surface)] tw:rounded-xl tw:shadow-lg tw:p-6">
        <h1 className="tw:text-xl tw:font-semibold tw:text-center tw:mb-1">Groceries</h1>
        <h2 className="tw:text-lg tw:font-medium tw:text-center tw:mb-6">Forgot your password?</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <EmailField
            value={email}
            handleChange={(event: ChangeEvent<HTMLInputElement>): void => setEmail(event.target.value)}
          />
          <FormSubmission submitText="Send me reset password instructions" />
        </form>
        <div className="tw:mt-4 tw:text-center">
          <Link to="/users/sign_in">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;
