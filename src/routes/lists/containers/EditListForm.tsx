import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';

import ListFormFields from '../components/ListFormFields';

export interface IEditListFormProps {
  listId: string;
  name: string;
  type: string;
  completed: boolean;
}

const EditListForm: React.FC<IEditListFormProps> = (props): React.JSX.Element => {
  const [name, setName] = useState(props.name);
  const [completed, setCompleted] = useState(props.completed);
  const [type, setType] = useState(props.type);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const list = {
      name,
      completed,
      type,
    };
    try {
      await axios.put(`/lists/${props.listId}`, { list });
      toast('List successfully updated', { type: 'info' });
      navigate('/lists');
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status)) {
          toast('List not found', { type: 'error' });
          navigate('/lists');
        } else {
          const keys = Object.keys(error.response.data!);
          const responseErrors = keys.map((key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`);
          toast(responseErrors.join(' and '), { type: 'error' });
        }
      } else if (error.request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(error.message, { type: 'error' });
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
          handleNameChange={({ target: { value } }: ChangeEvent<HTMLInputElement>): void => setName(value)}
          handleTypeChange={({ target: { value } }: ChangeEvent<HTMLInputElement>): void => setType(value)}
          handleCompletedChange={(): void => setCompleted(!completed)}
          editForm
        />
        <FormSubmission
          submitText="Update List"
          cancelAction={(): void => navigate('/lists')}
          cancelText="Cancel"
          displayCancelButton={true}
        />
      </Form>
    </React.Fragment>
  );
};

export default EditListForm;
