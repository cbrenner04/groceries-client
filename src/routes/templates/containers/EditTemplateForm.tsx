import React, { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { showToast } from '../../../utils/toast';
import { useNavigate } from 'react-router';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import Input from 'components/ui/Input';
import { Button } from 'components/ui/Button';
import type { IListItemConfiguration, IListItemFieldConfiguration, EListItemFieldType } from 'typings';

import FieldConfigurationRows, { type IFieldRow } from '../components/FieldConfigurationRows';

export interface IEditTemplateFormProps {
  template: IListItemConfiguration;
  fieldConfigurations: IListItemFieldConfiguration[];
  onCancel: () => void;
  onSaved?: () => void;
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

  const originalFieldIds = useMemo(() => props.fieldConfigurations.map((fc) => fc.id), [props.fieldConfigurations]);

  const isFormValid = (): boolean => {
    if (name.trim() === '') {
      return false;
    }
    if (fieldRows.some((row) => row.label.trim() === '')) {
      return false;
    }
    const positions = fieldRows.map((row) => row.position);
    if (positions.length !== new Set(positions).size) {
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
      if (name !== props.template.name) {
        await axios.put(`/list_item_configurations/${props.template.id}`, {
          list_item_configuration: { name },
        });
      }

      const fieldOperations: Promise<unknown>[] = [];

      fieldRows.forEach((row) => {
        if (!row.id) {
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
          const originalField = props.fieldConfigurations.find((fc) => fc.id === row.id);
          if (
            originalField &&
            (originalField.label !== row.label ||
              originalField.data_type !== row.dataType ||
              originalField.position !== row.position ||
              originalField.primary !== row.primary)
          ) {
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

      const currentFieldIds = fieldRows.map((row) => row.id).filter((id) => id);
      originalFieldIds.forEach((originalId) => {
        if (!currentFieldIds.includes(originalId)) {
          fieldOperations.push(
            axios.delete(`/list_item_configurations/${props.template.id}/list_item_field_configurations/${originalId}`),
          );
        }
      });

      await Promise.all(fieldOperations);

      showToast.info('Template successfully updated');
      if (props.onSaved) {
        props.onSaved();
      } else {
        navigate('/templates');
      }
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
    <form onSubmit={handleSubmit} autoComplete="off" className="tw:flex tw:flex-col tw:gap-4">
      <Input
        id="template-name"
        testId="template-name"
        name="template-name"
        label="Name"
        value={name}
        onChange={(event: ChangeEvent<HTMLInputElement>): void => setName(event.target.value)}
        placeholder="My template"
        error={showValidation && name.trim() === '' ? 'Name cannot be blank' : undefined}
      />
      <FieldConfigurationRows fieldRows={fieldRows} setFieldRows={setFieldRows} showValidation={showValidation} />
      <div className="tw:flex tw:flex-col sm:tw:flex-row sm:tw:justify-end tw:gap-2">
        <Button variant="ghost" type="button" onClick={props.onCancel} fullWidth className="sm:tw:w-auto">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={!isFormValid()} fullWidth className="sm:tw:w-auto">
          Update Template
        </Button>
      </div>
    </form>
  );
};

export default EditTemplateForm;
