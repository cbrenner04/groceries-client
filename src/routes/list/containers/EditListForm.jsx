import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

import Alert from '../../../components/Alert';
import { SelectField, TextField, CheckboxField } from '../../../components/FormFields';
import axios from '../../../utils/api';

function EditListForm(props) {
  const [errors, setErrors] = useState('');
  const [name, setName] = useState(props.name);
  const [completed, setCompleted] = useState(props.completed);
  const [type, setType] = useState(props.type);

  const handleSubmit = async event => {
    event.preventDefault();
    const list = {
      name,
      completed,
      type,
    };
    try {
      await axios.put(`/lists/${props.listId}`, { list });
      props.history.push('/lists');
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          // TODO: how do we pass error messages along?
          props.history.push('/users/sign_in');
        } else if (response.status === 403) {
          // TODO: how do we pass error messages along?
          props.history.push('/lists');
        } else {
          const keys = Object.keys(response.data);
          const responseErrors = keys.map(key => `${key} ${response.data[key]}`);
          setErrors(responseErrors.join(' and '));
        }
      } else if (request) {
        // TODO: what do here?
      } else {
        setErrors(message);
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
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
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
