import type { ChangeEvent, FormEvent } from 'react';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import ListFormFields from '../components/ListFormFields';
import axios from '../../../utils/api';
import FormSubmission from '../../../components/FormSubmission';

interface IEditListFormProps {
  listId: string;
  name: string;
  type: string;
  completed: boolean;
}

const EditListForm: React.FC<IEditListFormProps> = (props) => {
  const [name, setName] = useState(props.name);
  const [completed, setCompleted] = useState(props.completed);
  const [type, setType] = useState(props.type);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          navigate('/users/sign_in');
        } else if ([403, 404].includes(err.response.status)) {
          toast('List not found', { type: 'error' });
          navigate('/lists');
        } else {
          const keys = Object.keys(err.response.data);
          const responseErrors = keys.map((key) => `${key} ${err.response.data[key]}`);
          toast(responseErrors.join(' and '), { type: 'error' });
        }
      } else if (err.request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(err.message, { type: 'error' });
      }
    }
  };

  return (
    <>
      <h1>Edit {name}</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <ListFormFields
          name={name}
          type={type}
          completed={completed}
          handleNameChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => setName(value)}
          handleTypeChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => setType(value)}
          handleCompletedChange={() => setCompleted(!completed)}
          editForm
        />
        <FormSubmission
          submitText="Update List"
          cancelAction={() => navigate('/lists')}
          cancelText="Cancel"
          displayCancelButton={true}
        />
      </Form>
    </>
  );
};

export default EditListForm;
