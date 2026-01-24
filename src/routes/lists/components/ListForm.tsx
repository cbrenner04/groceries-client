import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';

import FormSubmission from 'components/FormSubmission';
import type { IList, IListItemConfiguration } from 'typings';

import ListFormFields from '../components/ListFormFields';

export interface IListFormProps {
  onFormSubmit: (list: IList) => Promise<void>;
  pending: boolean;
  configurations: IListItemConfiguration[];
}

const ListForm: React.FC<IListFormProps> = (props): React.JSX.Element => {
  const defaultConfigurationId = props.configurations[0]?.id ?? '';
  const [name, setName] = useState('');
  const [configurationId, setConfigurationId] = useState(defaultConfigurationId);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await props.onFormSubmit({ name, list_item_configuration_id: configurationId });
    setName('');
    setConfigurationId(defaultConfigurationId);
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
            configurationId={configurationId}
            configurations={props.configurations}
            handleNameChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
            handleConfigurationChange={(event: ChangeEvent<HTMLSelectElement>): void =>
              setConfigurationId(event.target.value)
            }
            completed={false}
            editForm={false}
          />
          <FormSubmission
            disabled={props.pending}
            submitText="Create List"
            cancelAction={(): void => setShowForm(false)}
            cancelText="Collapse Form"
          />
        </Form>
      </Collapse>
    </React.Fragment>
  );
};

export default ListForm;
