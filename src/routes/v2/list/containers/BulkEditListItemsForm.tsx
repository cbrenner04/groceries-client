import React, { type ChangeEventHandler, type FormEventHandler, useState, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';
import {
  EListType,
  type IV2ListItem,
  type IList,
  type IListUser,
  type IListItemConfiguration,
  type IListItemFieldConfiguration,
} from 'typings';

import { itemName } from '../utils';
import BulkEditListItemsFormFields from '../components/BulkEditListItemsFormFields';

export interface IBulkEditListItemsFormProps {
  navigate: (url: string) => void;
  items: IV2ListItem[];
  list: IList;
  lists: IList[];
  categories: string[];
  listUsers: IListUser[];
  listItemConfiguration: IListItemConfiguration;
  listItemFieldConfigurations: IListItemFieldConfiguration[];
}

interface IFieldUpdate {
  id: string;
  label: string;
  data: string;
  clear: boolean;
  fieldIds: string[];
}

const BulkEditListItemsForm: React.FC<IBulkEditListItemsFormProps> = (props): React.JSX.Element => {
  const getInitialFieldUpdates = useCallback(() => {
    // Initialize field updates based on common values across all items
    return props.listItemFieldConfigurations.map((config) => {
      const fieldValues = props.items.map((itemData) => {
        const field = itemData.fields.find((f) => f.label === config.label);
        return {
          id: field?.id ?? '',
          data: field?.data ?? '',
        };
      });

      // If all items have the same value for this field, use that value
      const uniqueDataValues = [...new Set(fieldValues.map((fv) => fv.data))];
      const commonValue = uniqueDataValues.length === 1 ? uniqueDataValues[0] : '';

      return {
        id: config.id,
        label: config.label,
        data: commonValue,
        clear: false,
        fieldIds: fieldValues.map((field) => field.id).filter((id) => id !== ''),
      };
    });
  }, [props.listItemFieldConfigurations, props.items]);

  const [fieldUpdates, setFieldUpdates] = useState<IFieldUpdate[]>(getInitialFieldUpdates);

  const handleFieldChange: ChangeEventHandler<HTMLInputElement> = (event): void => {
    const { name, value } = event.target;
    setFieldUpdates((prev) => prev.map((field) => (field.label === name ? { ...field, data: value } : field)));
  };

  const handleClearField = (label: string): void => {
    setFieldUpdates((prev) =>
      prev.map((field) =>
        field.label === label ? { ...field, clear: !field.clear, data: field.clear ? field.data : '' } : field,
      ),
    );
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event): Promise<void> => {
    event.preventDefault();

    const itemIds = props.items.map((item) => item.id).join(',');

    try {
      // Filter out fields that are empty and not marked for clearing, and have valid field IDs
      const fieldsToUpdate = fieldUpdates.filter((field) => (field.data || field.clear) && field.fieldIds.length > 0);

      // Group field IDs and data together as expected by the service
      const listItemFieldsAttributes = fieldsToUpdate.map((field) => ({
        list_item_field_ids: field.fieldIds,
        data: field.clear ? '' : field.data,
      }));

      await axios.put(`/v2/lists/${props.list.id}/list_items/bulk_update?item_ids=${itemIds}`, {
        item_ids: itemIds,
        list_id: props.list.id,
        list_items: {
          update_current_items: true,
          list_item_fields_attributes: listItemFieldsAttributes,
        },
      });

      toast('Items successfully updated', { type: 'info' });
      props.navigate(`/v2/lists/${props.list.id}`);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status!)) {
          toast('Some items not found', { type: 'error' });
          props.navigate(`/v2/lists/${props.list.id}`);
        } else {
          const keys = Object.keys(error.response.data!);
          const responseErrors = keys.map(
            (key: string) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
          );
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
      <h1>Edit {props.items.map((itemData) => itemName(itemData, props.list.type)).join(', ')}</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <BulkEditListItemsFormFields
          fieldConfigurations={props.listItemFieldConfigurations}
          fieldUpdates={fieldUpdates}
          handleFieldChange={handleFieldChange}
          handleClearField={handleClearField}
          listType={props.list.type}
        />
        <FormSubmission
          submitText="Update Items"
          cancelAction={(): void => props.navigate(`/v2/lists/${props.list.id}`)}
          cancelText="Cancel"
        />
      </Form>
    </React.Fragment>
  );
};

export default BulkEditListItemsForm;
