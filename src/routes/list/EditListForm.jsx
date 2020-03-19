import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

import Alert from '../../components/Alert';
import { SelectField, TextField, CheckboxField } from '../../components/FormFields';
import { setUserInfo } from '../../utils/auth';
import axios from '../../utils/api';

function EditListForm(props) {
  const [id, setId] = useState(0);
  const [errors, setErrors] = useState('');
  const [name, setName] = useState('');
  const [completed, setCompleted] = useState(false);
  const [type, setType] = useState('GroceryList');

  useEffect(() => {
    async function fetchData() {
      if (!props.match) props.history.push('/lists');
      try {
        const { data: { list, current_user_id: currentUserId }, headers } = await axios
          .get(`/lists/${props.match.params.id}/edit`, {
            headers: JSON.parse(sessionStorage.getItem('user')),
          });
        setUserInfo(headers);
        if (list.owner_id !== currentUserId) props.history.push('/lists');
        setId(list.id);
        setName(list.name);
        setCompleted(list.completed);
        setType(list.type);
      } catch ({ response, request, message }) {
        if (response) {
          setUserInfo(response.headers);
          if (response.status === 401) {
            // TODO: how do we pass error messages along?
            props.history.push('/users/sign_in');
          } else {
            // TODO: how do we pass error messages along?
            props.history.push('/lists');
          }
        } else if (request) {
          // TODO: what do here?
        } else {
          setErrors(message);
        }
      }
    }
    fetchData();
  }, [props.history, props.match]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const list = {
      name,
      completed,
      type,
    };
    try {
      const { headers } = await axios
        .put(
          `/lists/${id}`,
          { list },
          {
            headers: JSON.parse(sessionStorage.getItem('user')),
          },
        )
      setUserInfo(headers);
      props.history.push('/lists');
    } catch ({ response, request, message }) {
      if (response) {
        setUserInfo(response.headers);
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      list_id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default EditListForm;
