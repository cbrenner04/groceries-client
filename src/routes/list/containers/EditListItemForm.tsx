import React, { type ChangeEventHandler, type FormEventHandler, useState } from 'react';
import { Form } from 'react-bootstrap';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';
import CategoryField from 'components/FormFields/CategoryField';
import { capitalize } from 'utils/format';
import type { IListItem, IList, IListUser, IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

import ListItemFormFields from '../components/ListItemFormFields';

export interface IEditListItemFormProps {
  list: IList;
  item: IListItem;
  listUsers: IListUser[];
  listItemConfiguration: IListItemConfiguration;
  listItemFieldConfigurations: IListItemFieldConfiguration[];
  categories?: string[];
}

const EditListItemForm: React.FC<IEditListItemFormProps> = (props): React.JSX.Element => {
  // Merge all possible field configurations with existing fields
  const initialFields = props.listItemFieldConfigurations.map((config) => {
    const existingField = props.item.fields.find((field) => field.list_item_field_configuration_id === config.id);
    if (existingField) {
      return existingField;
    }
    // Placeholder for missing field
    return {
      id: '',
      list_item_field_configuration_id: config.id,
      label: config.label,
      data: '',
      user_id: '',
      list_item_id: props.item.id,
      created_at: '',
      updated_at: '',
      archived_at: null,
      position: config.position,
      data_type: config.data_type,
    };
  });
  const [fields, setFields] = useState(initialFields);
  const [category, setCategory] = useState(props.item.category ?? '');

  const setData: ChangeEventHandler<HTMLInputElement> = (element): void => {
    const { name, value } = element.target;
    const updatedFields = fields.map((field) => {
      if (field.label === name) {
        return { ...field, data: value };
      }
      return field;
    });
    setFields(updatedFields);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event): Promise<void> => {
    event.preventDefault();
    try {
      // Update category directly on the item
      const categoryValue = category.trim();
      const capitalizedCategory = categoryValue ? capitalize(categoryValue) : null;
      await axios.put(`/lists/${props.list.id}/list_items/${props.item.id}`, {
        list_item: { category: capitalizedCategory },
      });

      // Auto-create category record if new category was provided
      if (capitalizedCategory) {
        try {
          await axios.post(`/lists/${props.list.id}/categories`, { category: { name: capitalizedCategory } });
        } catch {
          // Category may already exist, ignore errors
        }
      }

      // Update, create, or archive each field as needed
      const normalizedFields = fields.map((field) => ({
        ...field,
        data: typeof field.data === 'string' ? field.data.trim() : field.data,
      }));

      const baseUrl = `/lists/${props.list.id}/list_items/${props.item.id}/list_item_fields`;
      await Promise.all(
        normalizedFields.map(async (field) => {
          /* istanbul ignore else */
          if (field.id && field.data === '') {
            // Archive (delete) the field if cleared
            await axios.delete(`${baseUrl}/${field.id}`);
          } else if (field.id && field.data !== '') {
            // Update existing field
            await axios.put(`${baseUrl}/${field.id}`, {
              list_item_field: {
                data: field.data,
                list_item_field_configuration_id: field.list_item_field_configuration_id,
              },
            });
          } else if (!field.id && field.data !== '') {
            // Create new field
            await axios.post(baseUrl, {
              list_item_field: {
                data: field.data,
                list_item_field_configuration_id: field.list_item_field_configuration_id,
              },
            });
          }
          // If no id and data is empty, do nothing
        }),
      );
      showToast.info('Item successfully updated');
      // TODO: why aren't we using navigate?
      window.location.href = `/lists/${props.list.id}`;
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          showToast.error('You must sign in');
          window.location.href = '/users/sign_in';
        } else if ([403, 404].includes(error.response.status)) {
          showToast.error('Item not found');
          window.location.href = `/lists/${props.list.id}`;
        } else {
          const keys = Object.keys(error.response.data!);
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
      <h1 data-test-id="page-title">Edit Item</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <ListItemFormFields
          fieldConfigurations={props.listItemFieldConfigurations}
          fields={fields}
          setFormData={setData}
          editForm
        />
        <CategoryField
          handleInput={(e): void => setCategory((e.target as HTMLInputElement).value)}
          category={category}
          categories={props.categories}
        />
        <FormSubmission
          submitText="Update Item"
          cancelAction={(): void => {
            window.location.href = `/lists/${props.list.id}`;
          }}
          cancelText="Cancel"
        />
      </Form>
    </React.Fragment>
  );
};

export default EditListItemForm;
