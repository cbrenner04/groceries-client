import React, { useState, type ChangeEventHandler, type ChangeEvent, type FormEvent } from 'react';
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
  copy?: boolean;
  move?: boolean;
  existing_list_id?: string;
  new_list_name?: string;
  update_current_items: boolean;
}

const BulkEditListItemsForm: React.FC<IBulkEditListItemsFormProps> = ({
  navigate,
  items,
  list,
  lists,
  categories,
  listUsers,
}): React.JSX.Element => {
  // if no existing list options, new list form should be displayed by default
  const existingListsOptions = lists.map((list) => ({ value: String(list.id), label: list.name }));

  // attributes that makes sense to updated on all items are included
  // set attributes to initial value if all items have the same value for the attribute
  // the value of these attributes can be cleared for all items with their respective clear state attributes
  // read, purchased, completed not included as they add complexity and they can be updated in bulk on the list itself
  const initialAttr = (attribute: keyof IListItem): string | Date | number | boolean | undefined => {
    const uniqValues = [...new Set(items.map(({ [attribute]: value }) => value))];
    return uniqValues.length === 1 && uniqValues[0] ? uniqValues[0] : undefined;
  };
  const initialDueBy = initialAttr('due_by');
  // TODO: this is kind of silly
  const initialValues = {
    copy: false,
    move: false,
    existingList: '',
    newListName: '',
    updateCurrentItems: false,
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
    dueBy: typeof initialDueBy !== 'boolean' ? formatDueBy(initialDueBy) : /* istanbul ignore next */ undefined,
    clearDueBy: false,
    quantity: initialAttr('quantity') as string | undefined,
    clearQuantity: false,
    showNewListForm: !existingListsOptions.length,
    allComplete: (initialAttr('purchased') ?? initialAttr('completed') ?? false) as boolean,
  };

  const [formData, setFormData] = useState(initialValues);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    // must have existing list or new list identified to copy or move
    if ((formData.copy || formData.move) && !formData.existingList && !formData.newListName) {
      toast(`You must specify a list to ${formData.copy ? 'copy' : 'move'} items`, { type: 'error' });
      return;
    }
    const putData: IPutData = {
      category: formData.category,
      author: formData.author,
      quantity: formData.quantity,
      artist: formData.artist,
      album: formData.album,
      assignee_id: formData.assigneeId,
      due_by: formData.dueBy,
      clear_category: formData.clearCategory,
      clear_author: formData.clearAuthor,
      clear_quantity: formData.clearQuantity,
      clear_artist: formData.clearArtist,
      clear_album: formData.clearAlbum,
      clear_assignee: formData.clearAssignee,
      clear_due_by: formData.clearDueBy,
      copy: undefined,
      move: undefined,
      existing_list_id: undefined,
      new_list_name: undefined,
      // if copying, the user will set whether or not to update current items
      // if moving, the current items will not be updated
      // if not doing either, updating the current items is the only action being take
      update_current_items: formData.copy ? formData.updateCurrentItems : !formData.move,
    };
    if (formData.copy) {
      putData.copy = formData.copy;
    }
    if (formData.move) {
      putData.move = formData.move;
    }
    if (formData.existingList) {
      putData.existing_list_id = formData.existingList;
    }
    if (formData.newListName) {
      putData.new_list_name = formData.newListName;
    }
    const itemIds = items.map(({ id }) => id).join(',');
    try {
      await axios.put(`/lists/${list.id}/list_items/bulk_update?item_ids=${itemIds}`, {
        list_items: putData,
      });
      toast('Items successfully updated', { type: 'info' });
      navigate(`/lists/${list.id}`);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status!)) {
          toast('Some items not found', { type: 'error' });
          navigate(`/lists/${list.id}`);
        } else {
          const keys = Object.keys(error.response.data!);
          // TODO: sort out typings
          const responseErrors = keys.map(
            (key: string) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
          );
          let joinString;
          if (list.type === EListType.BOOK_LIST || list.type === EListType.MUSIC_LIST) {
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

  const clearNewListForm = (): void => {
    const updatedFormData = update(formData, {
      newListName: { $set: '' },
      showNewListForm: { $set: initialValues.showNewListForm },
    });
    setFormData(updatedFormData);
  };

  const handleOtherListChange = (isCopy: boolean): void => {
    const [action, oppositeAction]: [keyof typeof formData, keyof typeof formData] = isCopy
      ? ['copy', 'move']
      : ['move', 'copy'];
    const updates: Record<string, { $set: boolean | string }> = {};
    if (!formData[action] && formData[oppositeAction]) {
      updates[oppositeAction] = { $set: false };
    }
    if (formData[action]) {
      updates.showNewListForm = { $set: initialValues.showNewListForm };
      updates.newListName = { $set: '' };
      updates.existingList = { $set: '' };
    }
    updates[action] = { $set: !formData[action] };
    const updatedFormData = update(formData, updates);
    setFormData(updatedFormData);
  };

  const handleInput = ({ target: { name, value, checked } }: ChangeEvent<HTMLInputElement>): void => {
    let newValue: string | boolean = value;
    if (name === 'updateCurrentItems') {
      newValue = checked;
    }
    const updatedFormData = update(formData, { [name]: { $set: newValue } });
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

  const handleShowNewListForm = (): void => {
    const updatedFormData = update(formData, {
      existingList: { $set: '' },
      showNewListForm: { $set: true },
    });
    setFormData(updatedFormData);
  };

  return (
    <React.Fragment>
      <h1>Edit {items.map((item) => itemName(item, list.type)).join(', ')}</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <BulkEditListItemsFormFields
          formData={formData}
          // TODO: is this what we want?
          handleInput={handleInput as unknown as ChangeEventHandler}
          clearAttribute={clearAttribute}
          listUsers={listUsers}
          listType={list.type}
          handleOtherListChange={handleOtherListChange}
          existingListsOptions={existingListsOptions}
          handleShowNewListForm={handleShowNewListForm}
          clearNewListForm={clearNewListForm}
          categories={categories}
        />
        <FormSubmission
          submitText="Update Items"
          cancelAction={(): void => navigate(`/lists/${list.id}`)}
          cancelText="Cancel"
          displayCancelButton={true}
        />
      </Form>
    </React.Fragment>
  );
};

export default BulkEditListItemsForm;
