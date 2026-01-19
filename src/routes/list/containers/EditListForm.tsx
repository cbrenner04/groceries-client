import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import { showToast } from 'utils/toast';
import FormSubmission from 'components/FormSubmission';

import ListFormFields from '../components/ListFormFields';

export interface IEditListFormProps {
  listId: string;
  name: string;
  type: string;
  completed: boolean;
  archivedAt: string | null;
  refreshed: boolean;
  listItemConfigurationId: string | null;
}

const EditListForm: React.FC<IEditListFormProps> = (props): React.JSX.Element => {
  const [name, setName] = useState(props.name);
  const [completed, setCompleted] = useState(props.completed);
  const [type, setType] = useState(props.type);
  const [refreshed, setRefreshed] = useState(props.refreshed);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const list = {
      name,
      completed,
      type,
      refreshed,
    };
    try {
      await axios.put(`/lists/${props.listId}`, { list });
      showToast.info('List successfully updated');
      navigate('/lists');
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
          const keys = Object.keys(error.response.data!);
          const responseErrors = keys.map((key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`);
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
    <React.Fragment>
      <h1>Edit {name}</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <ListFormFields
          name={name}
          type={type}
          completed={completed}
          refreshed={refreshed}
          handleNameChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
          handleTypeChange={(event: ChangeEvent<HTMLInputElement>): void => setType(event.target.value)}
          handleCompletedChange={(): void => setCompleted(!completed)}
          handleRefreshedChange={(): void => setRefreshed(!refreshed)}
          editForm
        />
        <FormSubmission
          submitText="Update List"
          cancelAction={(): void | Promise<void> => navigate('/lists')}
          cancelText="Cancel"
        />
      </Form>
    </React.Fragment>
  );
};

export default EditListForm;
