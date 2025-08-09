import React, { useEffect, useState, type ChangeEventHandler, type FormEventHandler } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import { TextField, CheckboxField, NumberField, DateField } from 'components/FormFields';
import FormSubmission from 'components/FormSubmission';
import { capitalize } from 'utils/format';
import type { IListItem, IListUser, IListItemConfiguration } from 'typings';

export interface IListItemFormProps {
  navigate: (path: string) => void;
  userId: string;
  listId: string;
  listUsers?: IListUser[];
  handleItemAddition: (data: IListItem[]) => void;
  categories?: string[];
  listItemConfiguration?: IListItemConfiguration;
  preloadedFieldConfigurations?: IFieldConfiguration[];
}

interface IFieldConfiguration {
  id: string;
  label: string;
  data_type: string;
  position: number;
}

interface IListItemDataRecord extends Record<string, string | number | boolean> {}

const ListItemForm: React.FC<IListItemFormProps> = (props) => {
  const [formData, setFormData] = useState({} as IListItemDataRecord);
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState(false);
  const [fieldConfigurations, setFieldConfigurations] = useState(
    (props.preloadedFieldConfigurations ?? []) as IFieldConfiguration[],
  );
  // Track whether configurations have been loaded (to avoid early "no config" flash)
  const [fieldConfigsLoaded, setFieldConfigsLoaded] = useState<boolean>(
    props.preloadedFieldConfigurations !== undefined,
  );

  // Sync with preloaded configurations from parent when they arrive
  useEffect(() => {
    if (props.preloadedFieldConfigurations !== undefined) {
      setFieldConfigurations(props.preloadedFieldConfigurations as IFieldConfiguration[]);
      setFieldConfigsLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.preloadedFieldConfigurations]);

  // Load field configurations when form is shown
  const loadFieldConfigurations = async (): Promise<void> => {
    try {
      if (!props.listItemConfiguration?.id) {
        // No configuration available, field configurations will remain empty
        return;
      }

      // If preloaded, don't refetch on first open
      if (fieldConfigurations.length > 0) {
        return;
      }

      const { data } = await axios.get(
        `/list_item_configurations/${props.listItemConfiguration.id}/list_item_field_configurations`,
      );
      const orderedData = data.sort((a: IFieldConfiguration, b: IFieldConfiguration) => a.position - b.position);
      setFieldConfigurations(orderedData);
      setFieldConfigsLoaded(true);
    } catch (err) {
      // Silently fail - field configurations will be empty
      /* istanbul ignore next */
    }
  };

  const setData: ChangeEventHandler<HTMLInputElement> = (element) => {
    const { name, value, type, checked } = element.target;
    let newValue: string | number | boolean;

    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'number') {
      newValue = Number(value);
    } else {
      newValue = value;
    }

    const data = update(formData, { [name]: { $set: newValue } });
    setFormData(data);
  };

  const handleShowForm = async (): Promise<void> => {
    setShowForm(true);
    await loadFieldConfigurations();
  };

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setPending(true);

    try {
      if (!props.listItemConfiguration?.id) {
        toast('No field configuration available for this list. Please contact support.', { type: 'error' });
        setPending(false);
        return;
      }

      // Step 1: Create the list item
      const { data: newItem } = await axios.post(`/v2/lists/${props.listId}/list_items`, {
        list_item: {
          user_id: props.userId,
        },
      });

      // Step 2: Get field configurations for this list item configuration
      const { data: fieldConfigurations } = await axios.get(
        `/list_item_configurations/${props.listItemConfiguration.id}/list_item_field_configurations`,
      );

      // Step 3: Add fields to the list item using the correct configuration IDs
      const fieldPromises = Object.entries(formData).map(async ([key, value]) => {
        /* istanbul ignore else */
        if (value !== '') {
          // Find the field configuration that matches this field
          const fieldConfig = fieldConfigurations.find((config: IFieldConfiguration) => config.label === key);
          if (fieldConfig) {
            const fieldValue = key === 'category' ? capitalize(String(value)) : String(value);
            await axios.post(`/v2/lists/${props.listId}/list_items/${newItem.id}/list_item_fields`, {
              list_item_field: {
                label: key,
                data: fieldValue,
                list_item_field_configuration_id: fieldConfig.id,
              },
            });
          }
        }
      });

      await Promise.all(fieldPromises);

      // Create the item with fields from form data
      const itemWithFields = {
        ...newItem,
        fields: Object.entries(formData)
          .filter(([, value]) => value !== '')
          .map(([key, value]) => ({
            id: `temp-${Date.now()}-${key}`, // temp id which will be overwritten on next pull from the server
            label: key,
            data: key === 'category' ? capitalize(String(value)) : String(value),
            list_item_field_configuration_id: fieldConfigurations.find(
              (config: IFieldConfiguration) => config.label === key,
            )?.id,
            user_id: props.userId,
            list_item_id: newItem.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            archived_at: null,
          })),
      };

      props.handleItemAddition([itemWithFields]);
      setPending(false);
      setFormData({} as IListItemDataRecord);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status!)) {
          toast('List not found', { type: 'error' });
          props.navigate('/lists');
        } else if (error.response.status === 422) {
          const responseTextKeys = Object.keys(error.response.data!);
          const responseErrors = responseTextKeys.map(
            (key: string) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
          );
          toast(responseErrors.join(' and '), { type: 'error' });
        } else {
          toast('Something went wrong. Data may be incomplete and user actions may not persist.', { type: 'error' });
        }
      } else if (error.request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(error.message, { type: 'error' });
      }
      setPending(false);
    }
  };

  // Render fields based on field configurations
  const renderFields = (): React.ReactNode => {
    if (!props.listItemConfiguration?.id) {
      return <p>This list doesn&apos;t have a field configuration set up. Please contact support to fix this issue.</p>;
    }

    // While loading (including error case), show skeleton to avoid warning flicker
    if (!fieldConfigsLoaded) {
      return (
        <div role="status" aria-busy="true" aria-live="polite">
          <div className="placeholder-glow">
            <span className="placeholder col-6" />
            <span className="placeholder col-4" />
            <span className="placeholder col-8" />
          </div>
        </div>
      );
    }

    // Loaded but empty → show definitive "no config" message
    if (fieldConfigurations.length === 0) {
      return <p>This list doesn&apos;t have a field configuration set up. Please contact support to fix this issue.</p>;
    }

    return fieldConfigurations.map((config: IFieldConfiguration) => {
      const fieldName = config.label;
      const fieldValue = (formData[fieldName] as string) || '';

      switch (config.data_type) {
        case 'boolean':
          return (
            <CheckboxField
              key={config.id}
              name={fieldName}
              label={capitalize(config.label)}
              value={(formData[fieldName] as boolean) || false}
              handleChange={setData}
            />
          );
        case 'date_time':
          return (
            <DateField
              key={config.id}
              name={fieldName}
              label={capitalize(config.label)}
              value={fieldValue}
              handleChange={setData}
            />
          );
        case 'number':
          return (
            <NumberField
              key={config.id}
              name={fieldName}
              label={capitalize(config.label)}
              value={formData[fieldName] as number}
              handleChange={setData}
            />
          );
        case 'free_text':
        default:
          return (
            <TextField
              key={config.id}
              name={fieldName}
              label={capitalize(config.label)}
              value={fieldValue}
              handleChange={setData}
            />
          );
      }
    });
  };

  return (
    <React.Fragment>
      {!showForm && (
        <Button
          data-test-id="add-item-button"
          variant="link"
          onClick={handleShowForm}
          aria-controls="form-collapse"
          aria-expanded={showForm}
        >
          Add Item
        </Button>
      )}
      <Collapse in={showForm}>
        <Form id="form-collapse" onSubmit={handleSubmit} autoComplete="off" data-test-id="list-item-form">
          {renderFields()}
          <FormSubmission
            disabled={pending}
            submitText="Add New Item"
            cancelAction={(): void => setShowForm(false)}
            cancelText="Collapse Form"
          />
        </Form>
      </Collapse>
    </React.Fragment>
  );
};

export default ListItemForm;
