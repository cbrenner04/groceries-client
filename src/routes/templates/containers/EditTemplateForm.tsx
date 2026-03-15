import React, { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { showToast } from '../../../utils/toast';
import { useNavigate } from 'react-router';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';
import type { IListItemConfiguration, IListItemFieldConfiguration, EListItemFieldType } from 'typings';

import FieldConfigurationRows, { type IFieldRow } from '../components/FieldConfigurationRows';

export interface IEditTemplateFormProps {
  template: IListItemConfiguration;
  fieldConfigurations: IListItemFieldConfiguration[];
}

const EditTemplateForm: React.FC<IEditTemplateFormProps> = (props): React.JSX.Element => {
  const [name, setName] = useState(props.template.name);
  const [fieldRows, setFieldRows] = useState<IFieldRow[]>(
    props.fieldConfigurations.map((fc) => ({
      key: fc.id,
      id: fc.id,
      label: fc.label,
      dataType: fc.data_type as EListItemFieldType,
      position: fc.position,
      primary: fc.primary,
    })),
  );
  const [showValidation, setShowValidation] = useState(false);
  const navigate = useNavigate();

  // Track original field IDs to detect deletions
  const originalFieldIds = useMemo(() => props.fieldConfigurations.map((fc) => fc.id), [props.fieldConfigurations]);

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

    try {
      // 1. Update template name if changed
      if (name !== props.template.name) {
        await axios.put(`/list_item_configurations/${props.template.id}`, {
          list_item_configuration: { name },
        });
      }

      // 2. Process field configurations
      const fieldOperations: Promise<unknown>[] = [];

      fieldRows.forEach((row) => {
        if (!row.id) {
          // New field
          fieldOperations.push(
            axios.post(`/list_item_configurations/${props.template.id}/list_item_field_configurations`, {
              list_item_field_configuration: {
                label: row.label,
                data_type: row.dataType,
                position: row.position,
                primary: row.primary,
              },
            }),
          );
        } else {
          // Check if field was modified
          const originalField = props.fieldConfigurations.find((fc) => fc.id === row.id);
          if (
            originalField &&
            (originalField.label !== row.label ||
              originalField.data_type !== row.dataType ||
              originalField.position !== row.position ||
              originalField.primary !== row.primary)
          ) {
            // Modified field
            fieldOperations.push(
              axios.put(`/list_item_configurations/${props.template.id}/list_item_field_configurations/${row.id}`, {
                list_item_field_configuration: {
                  label: row.label,
                  data_type: row.dataType,
                  position: row.position,
                  primary: row.primary,
                },
              }),
            );
          }
        }
      });

      // 3. Delete removed fields
      const currentFieldIds = fieldRows.map((row) => row.id).filter((id) => id);
      originalFieldIds.forEach((originalId) => {
        if (!currentFieldIds.includes(originalId)) {
          fieldOperations.push(
            axios.delete(`/list_item_configurations/${props.template.id}/list_item_field_configurations/${originalId}`),
          );
        }
      });

      // 4. Execute all field operations in parallel
      await Promise.all(fieldOperations);

      showToast.info('Template successfully updated');
      navigate('/templates');
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          showToast.error('You must sign in');
          navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status)) {
          showToast.error('Template not found');
          navigate('/templates');
        } else {
          const keys = Object.keys((error.response.data ?? {}) as Record<string, unknown>);
          const responseErrors = keys.map((key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`);
          showToast.error(responseErrors.join(' and '));
        }
      } else if (error.request) {
        showToast.error('Something went wrong');
      } else {
        showToast.error(error.message);
      }
    }
  };

  return (
    <React.Fragment>
      <h1>Edit Template</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <Form.Group className="mb-3" controlId="template-name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
            data-test-id="template-name"
            placeholder="My template"
            isInvalid={showValidation && name.trim() === ''}
          />
          {showValidation && name.trim() === '' && (
            <Form.Control.Feedback type="invalid">Name cannot be blank</Form.Control.Feedback>
          )}
        </Form.Group>
        <FieldConfigurationRows fieldRows={fieldRows} setFieldRows={setFieldRows} showValidation={showValidation} />
        <FormSubmission
          disabled={!isFormValid()}
          submitText="Update Template"
          cancelAction={(): void | Promise<void> => navigate('/templates')}
          cancelText="Cancel"
        />
      </Form>
    </React.Fragment>
  );
};

export default EditTemplateForm;
