import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form } from 'react-bootstrap';

import ListFormFields from '../components/ListFormFields';

function ListForm({ onFormSubmit }) {
  const defaultListType = 'GroceryList';
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultListType);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    onFormSubmit({ name, type });
    setName('');
    setType(defaultListType);
  };

  return (
    <>
      {!showForm && (
        <Button variant="link" onClick={() => setShowForm(true)} aria-controls="form-collapse" aria-expanded={showForm}>
          Add List
        </Button>
      )}
      <Collapse in={showForm}>
        <Form id="form-collapse" onSubmit={handleSubmit} autoComplete="off" style={{ padding: 6 }}>
          <ListFormFields
            name={name}
            type={type}
            handleNameChange={({ target: { value } }) => setName(value)}
            handleTypeChange={({ target: { value } }) => setType(value)}
          />
          <Button type="submit" variant="success" block>
            Create List
          </Button>
          <Button variant="link" onClick={() => setShowForm(false)} block>
            Collapse Form
          </Button>
        </Form>
      </Collapse>
    </>
  );
}

ListForm.propTypes = {
  onFormSubmit: PropTypes.func.isRequired,
};

export default ListForm;
