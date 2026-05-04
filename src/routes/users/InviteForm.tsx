import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { type AxiosError } from 'axios';

import { showToast } from '../../utils/toast';

import { EmailField } from 'components/FormFields';
import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';

const InviteForm: React.FC = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      await axios.post('/auth/invitation', { email });
      showToast.info(`${email} successfully invited`);
      navigate('/lists');
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          showToast.error('You must sign in');
          navigate('/users/sign_in');
        } else {
          const responseTextKeys = Object.keys((error.response.data ?? {}) as Record<string, unknown>);
          const responseErrors = responseTextKeys.map(
            (key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
          );
          showToast.error(responseErrors.join(' and '));
        }
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
        <h1 className="tw:text-xl tw:font-semibold tw:text-center tw:mb-6">Send Invitation</h1>
        <form onSubmit={handleSubmit}>
          <EmailField
            value={email}
            handleChange={(event: ChangeEvent<HTMLInputElement>): void => setEmail(event.target.value)}
          />
          <FormSubmission
            submitText="Invite User"
            cancelAction={(): void | Promise<void> => navigate('/lists')}
            cancelText="Cancel"
          />
        </form>
      </div>
    </div>
  );
};

export default InviteForm;
