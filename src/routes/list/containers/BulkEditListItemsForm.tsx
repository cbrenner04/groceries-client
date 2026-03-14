import React, { type ChangeEventHandler, type FormEventHandler, useState, useCallback } from 'react';
import { Form } from 'react-bootstrap';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';
import CategoryField from 'components/FormFields/CategoryField';
import { CheckboxField } from 'components/FormFields';
import { capitalize } from 'utils/format';
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

  // Determine initial category: if all items share the same category, show it; otherwise empty
  const allCategories = props.items.map((item) => item.category ?? '');
  const initialCategory = allCategories.every((c) => c === allCategories[0]) ? allCategories[0] : '';
  const [category, setCategory] = useState(initialCategory);
  const [clearCategory, setClearCategory] = useState(false);

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

  const handleClearCategory = (): void => {
    setClearCategory((prev) => {
      const next = !prev;
      if (next) {
        setCategory('');
      }
      return next;
    });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event): Promise<void> => {
    event.preventDefault();
    const itemIds = props.items.map((item) => item.id).join(',');
    const fieldsToUpdateData = buildBulkUpdateFieldsPayload(props.listItemFieldConfigurations, fieldUpdates);

    // Include category as a field_to_update when it has a value or user chose to clear it
    const categoryValue = category.trim();
    const capitalizedCategory = categoryValue ? capitalize(categoryValue) : '';
    const allItemIds = props.items.map((item) => item.id);
    const categoryFieldUpdate = {
      label: 'category',
      data: clearCategory ? '' : capitalizedCategory,
      item_ids: allItemIds,
    };
    const includeCategory = clearCategory || capitalizedCategory;
    const allFieldsToUpdate = includeCategory ? [...fieldsToUpdateData, categoryFieldUpdate] : fieldsToUpdateData;

    try {
      await axios.put(`/lists/${props.list.id}/list_items/bulk_update?item_ids=${itemIds}`, {
        item_ids: itemIds,
        list_id: props.list.id,
        list_items: {
          update_current_items: true,
          fields_to_update: allFieldsToUpdate,
        },
      });

      // Auto-create category record if new category was provided (not when clearing)
      if (capitalizedCategory && !clearCategory) {
        try {
          await axios.post(`/lists/${props.list.id}/categories`, { category: { name: capitalizedCategory } });
        } catch {
          // Category may already exist, ignore errors
        }
      }

      showToast.info('Items successfully updated');
      props.navigate(`/lists/${props.list.id}`);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          showToast.error('You must sign in');
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status ?? 0)) {
          showToast.error('Some items not found');
          props.navigate(`/lists/${props.list.id}`);
        } else {
          const keys = Object.keys((error.response.data ?? {}) as Record<string, unknown>);
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
      <h1 data-test-id="page-title">Edit Items</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <BulkEditListItemsFormFields
          fieldConfigurations={props.listItemFieldConfigurations}
          fieldUpdates={fieldUpdates}
          handleFieldChange={handleFieldChange}
          handleClearField={handleClearField}
        />
        <CategoryField
          handleInput={(e): void => {
            setCategory((e.target as HTMLInputElement).value);
            if (clearCategory) {
              setClearCategory(false);
            }
          }}
          category={clearCategory ? '' : category}
          categories={props.categories}
          child={
            <CheckboxField
              name="clear_category"
              label="Clear Category"
              value={clearCategory}
              handleChange={handleClearCategory}
              classes="ms-1 mt-1"
            />
          }
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
