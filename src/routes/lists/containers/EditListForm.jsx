import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import ListFormFields from '../components/ListFormFields';
import axios from '../../../utils/api';
import FormSubmission from '../../../components/FormSubmission';

function EditListForm(props) {
  const [name, setName] = useState(props.name);
  const [completed, setCompleted] = useState(props.completed);
  const [type, setType] = useState(props.type);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const list = {
      name,
      completed,
      type,
    };
    try {
      await axios.put(`/lists/${props.listId}`, { list });
      toast('List successfully updated', { type: 'info' });
      props.history.push('/lists');
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.history.push('/users/sign_in');
        } else if ([403, 404].includes(response.status)) {
          toast('List not found', { type: 'error' });
          props.history.push('/lists');
        } else {
          const keys = Object.keys(response.data);
          const responseErrors = keys.map((key) => `${key} ${response.data[key]}`);
          toast(responseErrors.join(' and '), { type: 'error' });
        }
      } else if (request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(message, { type: 'error' });
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
          handleNameChange={({ target: { value } }) => setName(value)}
          handleTypeChange={({ target: { value } }) => setType(value)}
          handleCompletedChange={() => setCompleted(!completed)}
          editForm
        />
        <FormSubmission
          submitText="Update List"
          cancelAction={() => props.history.push('/lists')}
          cancelText="Cancel"
        />
      </Form>
    </>
  );
}

EditListForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  listId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired,
};

export default EditListForm;
