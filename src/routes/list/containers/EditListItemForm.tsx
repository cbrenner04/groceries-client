import React, { type ChangeEventHandler, type FormEventHandler, useState } from 'react';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';
import { EListType, type IListItem, type IList, type IListUser } from 'typings';

import ListItemFormFields from '../components/ListItemFormFields';
import { itemName } from '../utils';

export interface IEditListItemFormProps {
  navigate: (url: string) => void;
  listUsers: IListUser[];
  item: IListItem;
  list: IList;
  userId: string;
}

const EditListItemForm: React.FC<IEditListItemFormProps> = (props): React.JSX.Element => {
  const [item, setItem] = useState(props.item);
  const setData: ChangeEventHandler<HTMLInputElement> = (element): void => {
    const { name, value } = element.target;
    let newValue: string | number = value;
    /* istanbul ignore else */
    if (name === 'number_in_series') {
      newValue = Number(value);
    }
    const data = update(item, { [name]: { $set: newValue } });
    setItem(data);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event): Promise<void> => {
    event.preventDefault();
    const putData = {
      list_item: {
        user_id: props.userId,
        product: item.product,
        task: item.task,
        content: item.content,
        quantity: item.quantity,
        purchased: item.purchased,
        completed: item.completed,
        author: item.author,
        title: item.title,
        read: item.read,
        artist: item.artist,
        album: item.album,
        due_by: item.due_by,
        assignee_id: item.assignee_id,
        number_in_series: item.number_in_series,
        category: item.category?.trim().toLowerCase(),
        list_id: props.list.id,
      },
    };
    try {
      await axios.put(`/lists/${props.list.id}/v1/list_items/${props.item.id}`, putData);
      toast('Item successfully updated', { type: 'info' });
      props.navigate(`/lists/${props.list.id}`);
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status)) {
          toast('Item not found', { type: 'error' });
          props.navigate(`/lists/${props.list.id}`);
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
      <h1>Edit {itemName(item, props.list.type)}</h1>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        <ListItemFormFields
          formData={item}
          setFormData={setData}
          categories={props.list.categories}
          listType={props.list.type}
          listUsers={props.listUsers}
          editForm
        />
        <FormSubmission
          submitText="Update Item"
          cancelAction={(): void => props.navigate(`/lists/${props.list.id}`)}
          cancelText="Cancel"
        />
      </Form>
    </React.Fragment>
  );
};

export default EditListItemForm;
