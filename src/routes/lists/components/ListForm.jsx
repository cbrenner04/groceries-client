import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form } from 'react-bootstrap';

import ListFormFields from '../components/ListFormFields';
import FormSubmission from '../../../components/FormSubmission';

function ListForm({ onFormSubmit, pending }) {
  const defaultListType = 'GroceryList';
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultListType);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onFormSubmit({ name, type });
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
        <Form id="form-collapse" onSubmit={handleSubmit} autoComplete="off">
          <ListFormFields
            name={name}
            type={type}
            handleNameChange={({ target: { value } }) => setName(value)}
            handleTypeChange={({ target: { value } }) => setType(value)}
          />
          <FormSubmission
            disabled={pending}
            submitText="Create List"
            cancelAction={() => setShowForm(false)}
            cancelText="Collapse Form"
          />
        </Form>
      </Collapse>
    </>
  );
}

ListForm.propTypes = {
  onFormSubmit: PropTypes.func.isRequired,
  pending: PropTypes.bool.isRequired,
};

export default ListForm;
