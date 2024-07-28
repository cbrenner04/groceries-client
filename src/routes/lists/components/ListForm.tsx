import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';

import FormSubmission from 'components/FormSubmission';
import { EListType, type IList } from 'typings';

import ListFormFields from '../components/ListFormFields';

export interface IListFormProps {
  onFormSubmit: (list: IList) => Promise<void>;
  pending: boolean;
}

const ListForm: React.FC<IListFormProps> = ({ onFormSubmit, pending }): React.JSX.Element => {
  const defaultListType = EListType.GROCERY_LIST;
  const [name, setName] = useState('');
  const [type, setType] = useState(defaultListType);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    // TODO: figure this out.
    await onFormSubmit({ name, type });
    setName('');
    setType(defaultListType);
  };

  return (
    <React.Fragment>
      {!showForm && (
        <Button
          variant="link"
          onClick={(): void => setShowForm(true)}
          aria-controls="form-collapse"
          aria-expanded={showForm}
        >
          Add List
        </Button>
      )}
      <Collapse in={showForm}>
        <Form id="form-collapse" onSubmit={handleSubmit} autoComplete="off">
          <ListFormFields
            name={name}
            type={type}
            handleNameChange={({ target: { value } }: ChangeEvent<HTMLInputElement>): void => setName(value)}
            handleTypeChange={({ target: { value } }: ChangeEvent<HTMLInputElement>): void =>
              setType(value as EListType)
            }
            completed={false}
            handleCompletedChange={/* istanbul ignore next */ (): undefined => undefined}
            editForm={false}
          />
          <FormSubmission
            disabled={pending}
            submitText="Create List"
            cancelAction={(): void => setShowForm(false)}
            cancelText="Collapse Form"
            displayCancelButton={true}
          />
        </Form>
      </Collapse>
    </React.Fragment>
  );
};

export default ListForm;
