import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { SelectField, TextField, CheckboxField } from '../../../components/FormFields';
import axios from '../../../utils/api';

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
      <Button href="/lists" className="float-right" variant="link">
        Back to lists
      </Button>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <TextField name="name" label="Name" value={name} handleChange={({ target: { value } }) => setName(value)} />
        <SelectField
          name="type"
          label="Type"
          value={type}
          handleChange={({ target: { value } }) => setType(value)}
          options={[
            { value: 'BookList', label: 'books' },
            { value: 'GroceryList', label: 'groceries' },
            { value: 'MusicList', label: 'music' },
            { value: 'ToDoList', label: 'to-do' },
          ]}
          blankOption={false}
        />
        <CheckboxField
          name="completed"
          label="Completed"
          value={completed}
          handleChange={() => setCompleted(!completed)}
          blankOption={false}
          classes="mb-3"
        />
        <Button type="submit" variant="success" block>
          Update List
        </Button>
      </Form>
    </>
  );
}

EditListForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  listId: PropTypes.number,
  name: PropTypes.string,
  type: PropTypes.string,
  completed: PropTypes.bool,
};

export default EditListForm;
