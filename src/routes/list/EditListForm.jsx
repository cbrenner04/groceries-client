import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as $ from 'jquery';
import { Button, Form } from 'react-bootstrap';

import * as config from '../../config/default';
import Alert from '../../components/Alert';
import { SelectField, TextField, CheckboxField } from '../../components/FormFields';
import { setUserInfo } from '../../utils/auth';

function EditListForm(props) {
  const [id, setId] = useState(0);
  const [errors, setErrors] = useState('');
  const [name, setName] = useState('');
  const [completed, setCompleted] = useState(false);
  const [type, setType] = useState('GroceryList');

  useEffect(() => {
    if (!props.match) props.history.push('/lists');
    $.ajax({
      type: 'GET',
      url: `${config.apiBase}/lists/${props.match.params.id}/edit`,
      dataType: 'JSON',
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done(({ list, current_user_id: currentUserId }, _status, request) => {
      setUserInfo(request);
      if (list.owner_id !== currentUserId) props.history.push('/lists');
      setId(list.id);
      setName(list.name);
      setCompleted(list.completed);
      setType(list.type);
    });
  }, [props.history, props.match]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const list = {
      name,
      completed,
      type,
    };
    $.ajax({
      url: `${config.apiBase}/lists/${id}`,
      data: { list },
      method: 'PUT',
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done((_data, _status, request) => {
      setUserInfo(request);
      props.history.push('/lists');
    }).fail((response) => {
      const responseJSON = JSON.parse(response.responseText);
      const returnedErrors = Object.keys(responseJSON).map(key => `${key} ${responseJSON[key]}`);
      setErrors(returnedErrors.join(' and '));
    });
  };

  return (
    <>
      <h1>Edit { name }</h1>
      <Button href="/lists" className="float-right" variant="link">
        Back to lists
      </Button>
      <br />
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <TextField
          name="name"
          label="Name"
          value={name}
          handleChange={({ target: { value } }) => setName(value)}
        />
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
