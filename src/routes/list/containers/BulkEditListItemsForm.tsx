import React, { useState, type ChangeEventHandler, type FormEvent } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';
import { type AxiosError } from 'axios';

import { formatDueBy } from 'utils/format';
import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';
import { EListType, type IList, type IListItem, type IListUser } from 'typings';

import { itemName } from '../utils';
import BulkEditListItemsFormFields from '../components/BulkEditListItemsFormFields';

// TODO: this is ridiculous
export interface IBulkEditListItemsFormProps {
  navigate: (url: string) => void;
  items: IListItem[];
  list: IList;
  lists: IList[];
  categories: string[];
  listUsers: IListUser[];
}

interface IPutData {
  category?: string;
  author?: string;
  quantity?: string;
  artist?: string;
  album?: string;
  assignee_id?: string;
  due_by?: string;
  clear_category: boolean;
  clear_author: boolean;
  clear_quantity: boolean;
  clear_artist: boolean;
  clear_album: boolean;
  clear_assignee: boolean;
  clear_due_by: boolean;
  update_current_items: boolean; // TODO: remove when copy/move has been fully removed from bulk update
}

const BulkEditListItemsForm: React.FC<IBulkEditListItemsFormProps> = (props): React.JSX.Element => {
  // attributes that makes sense to updated on all items are included
  // set attributes to initial value if all items have the same value for the attribute
  // the value of these attributes can be cleared for all items with their respective clear state attributes
  // read, purchased, completed not included as they add complexity and they can be updated in bulk on the list itself
  const initialAttr = (attribute: keyof IListItem): string | Date | number | boolean | undefined => {
    const uniqValues = [...new Set(props.items.map((item) => item[attribute]))];
    return uniqValues.length === 1 && uniqValues[0] ? uniqValues[0] : undefined;
  };
  const initialDueBy = initialAttr('due_by');
  // TODO: this is kind of silly
  const initialValues = {
    album: initialAttr('album') as string | undefined,
    clearAlbum: false,
    artist: initialAttr('artist') as string | undefined,
    clearArtist: false,
    assigneeId: initialAttr('assignee_id') as string | undefined,
    clearAssignee: false,
    author: initialAttr('author') as string | undefined,
    clearAuthor: false,
    category: initialAttr('category') as string | undefined,
    clearCategory: false,
    due_by: typeof initialDueBy !== 'boolean' ? formatDueBy(initialDueBy) : /* istanbul ignore next */ undefined,
    clearDueBy: false,
    quantity: initialAttr('quantity') as string | undefined,
    clearQuantity: false,
    allComplete: (initialAttr('purchased') ?? initialAttr('completed') ?? false) as boolean,
  };

  const [formData, setFormData] = useState(initialValues);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const putData: IPutData = {
      category: formData.category,
      author: formData.author,
      quantity: formData.quantity,
      artist: formData.artist,
      album: formData.album,
      assignee_id: formData.assigneeId,
      due_by: formData.due_by,
      clear_category: formData.clearCategory,
      clear_author: formData.clearAuthor,
      clear_quantity: formData.clearQuantity,
      clear_artist: formData.clearArtist,
      clear_album: formData.clearAlbum,
      clear_assignee: formData.clearAssignee,
      clear_due_by: formData.clearDueBy,
      update_current_items: true, // TODO: remove when copy/move has been fully removed from bulk update
    };
    const itemIds = props.items.map((item) => item.id).join(',');
    try {
      await axios.put(`/lists/${props.list.id}/v1/list_items/bulk_update?item_ids=${itemIds}`, {
        list_items: putData,
      });
      toast('Items successfully updated', { type: 'info' });
      props.navigate(`/lists/${props.list.id}`);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status!)) {
          toast('Some items not found', { type: 'error' });
          props.navigate(`/lists/${props.list.id}`);
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

  const handleInput: ChangeEventHandler<HTMLInputElement> = (element): void => {
    const { name, value } = element.target;
    const updatedFormData = update(formData, { [name]: { $set: value } });
    setFormData(updatedFormData);
  };

  const clearAttribute = (attribute: keyof typeof formData, clearAttribute: keyof typeof formData): void => {
    const updates: Record<string, { $set: number | boolean | string | undefined }> = {};
    if (!formData[clearAttribute] && formData[attribute]) {
      updates[attribute] = { $set: '' };
    }
    if (formData[clearAttribute]) {
      updates[attribute] = { $set: initialValues[attribute] };
    }
    updates[clearAttribute] = { $set: !formData[clearAttribute] };
    const updatedFormData = update(formData, updates);
    setFormData(updatedFormData);
  };

  return (
    <React.Fragment>
      <h1>Edit {props.items.map((item) => itemName(item, props.list.type)).join(', ')}</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <BulkEditListItemsFormFields
          formData={formData}
          handleInput={handleInput}
          clearAttribute={clearAttribute}
          listUsers={props.listUsers}
          listType={props.list.type}
          categories={props.categories}
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
