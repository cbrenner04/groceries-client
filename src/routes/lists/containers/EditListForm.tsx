import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import { showToast } from 'utils/toast';
import Input from 'components/ui/Input';
import Checkbox from 'components/ui/Checkbox';
import { Button } from 'components/ui/Button';

export interface IEditListFormProps {
  listId: string;
  name: string;
  completed: boolean;
  refreshed: boolean;
  archivedAt: string | null;
  listItemConfigurationId: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

const EditListForm: React.FC<IEditListFormProps> = (props): React.JSX.Element => {
  const [name, setName] = useState(props.name);
  const [completed, setCompleted] = useState(props.completed);
  const [refreshed, setRefreshed] = useState(props.refreshed);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setPending(true);
    const list = { name, completed, refreshed };
    try {
      await axios.put(`/lists/${props.listId}`, { list });
      showToast.info('List successfully updated');
      props.onClose();
      if (props.onSaved) {
        props.onSaved();
      } else {
        navigate('/lists');
      }
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          showToast.error('You must sign in');
          navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status)) {
          showToast.error('List not found');
          navigate('/lists');
        } else {
          const keys = Object.keys((error.response.data ?? {}) as Record<string, unknown>);
          const responseErrors = keys.map((key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`);
          showToast.error(responseErrors.join(' and '));
        }
      } else if (error.request) {
        showToast.error('Something went wrong');
      } else {
        showToast.error(error.message);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="off" className="tw:flex tw:flex-col tw:gap-4">
      <Input
        id="name"
        name="name"
        label="Name"
        value={name}
        onChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
        placeholder="My super cool list"
      />
      <Checkbox
        id="completed"
        name="completed"
        label="Completed"
        checked={completed}
        onChange={(): void => setCompleted(!completed)}
      />
      <Checkbox
        id="refreshed"
        name="refreshed"
        label="Refreshed"
        checked={refreshed}
        onChange={(): void => setRefreshed(!refreshed)}
      />
      <div className="tw:flex tw:justify-end tw:gap-2 tw:mt-2">
        <Button variant="ghost" onClick={props.onClose} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={pending} loading={pending}>
          Update List
        </Button>
      </div>
    </form>
  );
};

export default EditListForm;
