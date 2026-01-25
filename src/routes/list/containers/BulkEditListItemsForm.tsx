import React, { type ChangeEventHandler, type FormEventHandler, useState, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';
import type { IListItem, IList, IListUser, IListItemConfiguration, IListItemFieldConfiguration } from 'typings';

import BulkEditListItemsFormFields from '../components/BulkEditListItemsFormFields';
import {
  buildBulkUpdateFieldsPayload,
  getInitialBulkFieldUpdates,
  parseBulkFieldChange,
  type IBulkFieldUpdate,
} from '../fieldHelpers';

export interface IBulkEditListItemsFormProps {
  navigate: (url: string) => void;
  items: IListItem[];
  list: IList;
  lists: IList[];
  categories: string[];
  listUsers: IListUser[];
  listItemConfiguration: IListItemConfiguration;
  listItemFieldConfigurations: IListItemFieldConfiguration[];
}

const BulkEditListItemsForm: React.FC<IBulkEditListItemsFormProps> = (props): React.JSX.Element => {
  const getInitial = useCallback(
    () => getInitialBulkFieldUpdates(props.listItemFieldConfigurations, props.items),
    [props.listItemFieldConfigurations, props.items],
  );
  const [fieldUpdates, setFieldUpdates] = useState<IBulkFieldUpdate[]>(getInitial);

  const handleFieldChange: ChangeEventHandler<HTMLInputElement> = (event): void => {
    const parsed = parseBulkFieldChange(event, props.listItemFieldConfigurations);
    if (!parsed) {
      return;
    }

    setFieldUpdates((prev) => prev.map((f) => (f.label === parsed.label ? { ...f, data: parsed.data } : f)));
  };

  const handleClearField = (label: string): void => {
    setFieldUpdates((prev) =>
      prev.map((f) => {
        if (f.label !== label) {
          return f;
        }
        const clear = !f.clear;
        return { ...f, clear, data: clear ? '' : f.data };
      }),
    );
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event): Promise<void> => {
    event.preventDefault();
    const itemIds = props.items.map((item) => item.id).join(',');
    const fieldsToUpdateData = buildBulkUpdateFieldsPayload(props.listItemFieldConfigurations, fieldUpdates);

    try {
      await axios.put(`/lists/${props.list.id}/list_items/bulk_update?item_ids=${itemIds}`, {
        item_ids: itemIds,
        list_id: props.list.id,
        list_items: {
          update_current_items: true,
          fields_to_update: fieldsToUpdateData,
        },
      });

      showToast.info('Items successfully updated');
      props.navigate(`/lists/${props.list.id}`);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          showToast.error('You must sign in');
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status!)) {
          showToast.error('Some items not found');
          props.navigate(`/lists/${props.list.id}`);
        } else {
          const keys = Object.keys(error.response.data!);
          const responseErrors = keys.map(
            (key: string) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
          );
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
      <h1>Edit Items</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <BulkEditListItemsFormFields
          fieldConfigurations={props.listItemFieldConfigurations}
          fieldUpdates={fieldUpdates}
          handleFieldChange={handleFieldChange}
          handleClearField={handleClearField}
        />
        <FormSubmission
          submitText="Update Items"
          cancelAction={(): void => props.navigate(`/lists/${props.list.id}`)}
          cancelText="Cancel"
        />
      </Form>
    </React.Fragment>
  );
};

export default BulkEditListItemsForm;
