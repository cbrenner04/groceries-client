import React, { type ChangeEventHandler, type FormEventHandler, useState } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';
import {
  EListType,
  type IListItem,
  type IList,
  type IListUser,
  type IListItemConfiguration,
  type IListItemFieldConfiguration,
} from 'typings';

import ListItemFormFields from '../components/ListItemFormFields';
import { itemName } from '../utils';

export interface IEditListItemFormProps {
  list: IList;
  item: IListItem;
  listUsers: IListUser[];
  listItemConfiguration: IListItemConfiguration;
  listItemFieldConfigurations: IListItemFieldConfiguration[];
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
      position: config.position ?? 0,
      data_type: config.data_type,
    };
  });
  const [fields, setFields] = useState(initialFields);

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
      // Update, create, or archive each field as needed
      await Promise.all(
        fields.map(async (field) => {
          /* istanbul ignore else */
          if (field.id && field.data === '') {
            // Archive (delete) the field if cleared
            await axios.delete(`/v2/lists/${props.list.id}/list_items/${props.item.id}/list_item_fields/${field.id}`);
          } else if (field.id && field.data !== '') {
            // Update existing field
            await axios.put(`/v2/lists/${props.list.id}/list_items/${props.item.id}/list_item_fields/${field.id}`, {
              list_item_field: {
                data: field.data,
                list_item_field_configuration_id: field.list_item_field_configuration_id,
              },
            });
          } else if (!field.id && field.data !== '') {
            // Create new field
            await axios.post(`/v2/lists/${props.list.id}/list_items/${props.item.id}/list_item_fields`, {
              list_item_field: {
                data: field.data,
                list_item_field_configuration_id: field.list_item_field_configuration_id,
              },
            });
          }
          // If no id and data is empty, do nothing
        }),
      );
      toast('Item successfully updated', { type: 'info' });
      // TODO: why aren't we using navigate?
      window.location.href = `/lists/${props.list.id}`;
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          window.location.href = '/users/sign_in';
        } else if ([403, 404].includes(error.response.status)) {
          toast('Item not found', { type: 'error' });
          window.location.href = `/lists/${props.list.id}`;
        } else {
          const keys = Object.keys(error.response.data!);
          const responseErrors = keys.map((key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`);
          let joinString;
          if (props.list.type === EListType.BOOK_LIST || props.list.type === EListType.MUSIC_LIST) {
            joinString = ' or ';
          } else {
            joinString = ' and ';
          }
          toast(responseErrors.join(joinString), { type: 'error' });
        }
      } else if (error.request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(error.message, { type: 'error' });
      }
    }
  };

  return (
    <React.Fragment>
      <h1>Edit {itemName(props.item, props.list.type)}</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <ListItemFormFields
          fieldConfigurations={props.listItemFieldConfigurations}
          fields={fields}
          setFormData={setData}
          listType={props.list.type}
          editForm
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
