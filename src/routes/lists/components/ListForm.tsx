import type { ChangeEvent, FormEvent } from 'react';
import React, { useState } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';

import ListFormFields from '../components/ListFormFields';
import FormSubmission from '../../../components/FormSubmission';
import type { IList } from '../../../typings';
import { EListType } from '../../../typings';

interface IListFormProps {
  onFormSubmit: (list: IList) => Promise<void>;
  pending: boolean;
}

const ListForm: React.FC<IListFormProps> = ({ onFormSubmit, pending }) => {
  const defaultListType = EListType.GROCERY_LIST;
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultListType as EListType);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: figure this out.
    await onFormSubmit({ name, type } as IList);
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
            handleNameChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => setName(value)}
            handleTypeChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => setType(value as EListType)}
          />
          <FormSubmission
            disabled={pending}
            submitText="Create List"
            cancelAction={() => setShowForm(false)}
            cancelText="Collapse Form"
            displayCancelButton={true}
          />
        </Form>
      </Collapse>
    </>
  );
};

export default ListForm;
