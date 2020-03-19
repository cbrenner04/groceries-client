import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

import { SelectField, TextField } from '../../../components/FormFields';

function ListForm(props) {
  const defaultListType = 'GroceryList';
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultListType);

  const handleSubmit = event => {
    event.preventDefault();
    props.onFormSubmit({
      name,
      type,
    });
    setName('');
    setType(defaultListType);
  };

  return (
    <Form onSubmit={handleSubmit} autoComplete="off">
      <TextField
        name="name"
        label="Name"
        value={name}
        handleChange={({ target: { value } }) => setName(value)}
        placeholder="My super cool list"
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
      <Button type="submit" variant="success" block>
        Create List
      </Button>
    </Form>
  );
}

ListForm.propTypes = {
  onFormSubmit: PropTypes.func.isRequired,
};

export default ListForm;
