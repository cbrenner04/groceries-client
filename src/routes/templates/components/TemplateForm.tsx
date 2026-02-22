import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';
import { EListItemFieldType } from 'typings';

import FormSubmission from 'components/FormSubmission';
import FieldConfigurationRows, { type IFieldRow } from './FieldConfigurationRows';

export interface ITemplateFormProps {
  onFormSubmit: (name: string, fieldRows: IFieldRow[]) => Promise<void>;
  pending: boolean;
}

const TemplateForm: React.FC<ITemplateFormProps> = (props): React.JSX.Element => {
  const [name, setName] = useState('');
  const [fieldRows, setFieldRows] = useState<IFieldRow[]>([
    {
      key: '0',
      label: '',
      dataType: EListItemFieldType.FREE_TEXT,
      position: 1,
      primary: true,
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const isFormValid = (): boolean => {
    if (name.trim() === '') {
      return false;
    }

    if (fieldRows.some((row) => row.label.trim() === '')) {
      return false;
    }

    const positions = fieldRows.map((row) => row.position);
    const uniquePositions = new Set(positions);
    if (positions.length !== uniquePositions.size) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setShowValidation(true);

    if (!isFormValid()) {
      return;
    }

    await props.onFormSubmit(name, fieldRows);
    setName('');
    setFieldRows([
      {
        key: '0',
        label: '',
        dataType: EListItemFieldType.FREE_TEXT,
        position: 1,
        primary: true,
      },
    ]);
    setShowForm(false);
    setShowValidation(false);
  };

  return (
    <React.Fragment>
      {!showForm && (
        <Button
          variant="link"
          onClick={(): void => setShowForm(true)}
          aria-controls="form-collapse"
          aria-expanded={showForm}
          data-test-id="add-template-button"
        >
          Add Template
        </Button>
      )}
      <Collapse in={showForm}>
        <Form id="form-collapse" onSubmit={handleSubmit} autoComplete="off">
           <Form.Group className="mb-3" controlId="template-form-name">
             <Form.Label>Name</Form.Label>
             <Form.Control
               type="text"
               value={name}
               onChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
               data-test-id="template-form-name"
               isInvalid={showValidation && name.trim() === ''}
             />
             {showValidation && name.trim() === '' && (
               <Form.Control.Feedback type="invalid">Name cannot be blank</Form.Control.Feedback>
             )}
           </Form.Group>
          <FieldConfigurationRows fieldRows={fieldRows} setFieldRows={setFieldRows} showValidation={showValidation} />
          <FormSubmission
            disabled={props.pending || !isFormValid()}
            submitText="Create Template"
            cancelAction={(): void => setShowForm(false)}
            cancelText="Collapse Form"
          />
        </Form>
      </Collapse>
    </React.Fragment>
  );
};

export default TemplateForm;
