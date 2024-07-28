import React, { useState, type ChangeEventHandler, type FormEventHandler } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';
import { type AxiosError } from 'axios';

import axios from 'utils/api';
import FormSubmission from 'components/FormSubmission';
import { EListType, type IListItem, type IListUser } from 'typings';

import ListItemFormFields from './ListItemFormFields';

export interface IListItemFormProps {
  navigate: (path: string) => void;
  userId: string;
  listId: string;
  listType: EListType;
  listUsers?: IListUser[];
  handleItemAddition: (data: IListItem[]) => void;
  categories?: string[];
}

const ListItemForm: React.FC<IListItemFormProps> = (props) => {
  const [formData, setFormData] = useState({} as IListItem);
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState(false);

  const setData: ChangeEventHandler<HTMLInputElement> = ({ target: { name, value } }) => {
    let newValue: string | number = value;
    if (name === 'number_in_series') {
      newValue = Number(value);
    }
    const data = update(formData, { [name]: { $set: newValue } });
    setFormData(data);
  };

  const handleSubmit: FormEventHandler = async (event) => {
    event.preventDefault();
    setPending(true);
    const postData = {
      list_item: {
        user_id: props.userId,
        product: formData.product,
        task: formData.task,
        content: formData.content,
        quantity: formData.quantity,
        author: formData.author,
        title: formData.title,
        artist: formData.artist,
        album: formData.album,
        assignee_id: formData.assignee_id,
        due_by: formData.due_by,
        number_in_series: formData.number_in_series,
        category: (formData.category ?? '').trim().toLowerCase(),
      },
    };
    try {
      const { data } = await axios.post(`/lists/${props.listId}/list_items`, postData);
      props.handleItemAddition(data);
      // setFormData(defaultFormState);
      setPending(false);
      toast('Item successfully added.', { type: 'info' });
    } catch (err: unknown) {
      const error = err as AxiosError;
      if (error.response) {
        if (error.response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(error.response.status!)) {
          toast('List not found', { type: 'error' });
          props.navigate('/lists');
        } else {
          const responseTextKeys = Object.keys(error.response.data!);
          const responseErrors = responseTextKeys.map(
            (key: string) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
          );
          let joinString;
          if (props.listType === EListType.BOOK_LIST || props.listType === EListType.MUSIC_LIST) {
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
      {!showForm && (
        <Button
          variant="link"
          onClick={(): void => setShowForm(true)}
          aria-controls="form-collapse"
          aria-expanded={showForm}
        >
          Add Item
        </Button>
      )}
      <Collapse in={showForm}>
        <Form id="form-collapse" onSubmit={handleSubmit} autoComplete="off" data-test-id="list-item-form">
          <ListItemFormFields
            formData={formData}
            setFormData={setData}
            categories={props.categories ?? []}
            listType={props.listType}
            listUsers={props.listUsers ?? []}
          />
          <FormSubmission
            disabled={pending}
            submitText="Add New Item"
            cancelAction={(): void => setShowForm(false)}
            cancelText="Collapse Form"
            displayCancelButton={true}
          />
        </Form>
      </Collapse>
    </React.Fragment>
  );
};

export default ListItemForm;
