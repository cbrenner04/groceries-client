import React, { ChangeEventHandler, FormEventHandler, ChangeEvent, useState } from 'react';
import { Button, Collapse, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';

import ListItemFormFields from './ListItemFormFields';
import axios from '../../../utils/api';
import FormSubmission from '../../../components/FormSubmission';
import { EListType, IListUser } from '../../../typings';

interface IListItemFormProps {
  navigate: (path: string) => void;
  userId: string;
  listId: string;
  listType: EListType;
  listUsers?: IListUser[];
  handleItemAddition: (data: any) => void;
  categories?: string[];
}

export const defaultFormState = {
  product: '',
  task: '',
  content: '',
  quantity: '',
  author: '',
  title: '',
  artist: '',
  album: '',
  assigneeId: '',
  dueBy: '',
  numberInSeries: 0,
  category: '',
};

const ListItemForm: React.FC<IListItemFormProps> = (props) => {
  const [formData, setFormData] = useState(defaultFormState);
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState(false);

  const setData = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number = value;
    if (name === 'numberInSeries') {
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
        assignee_id: formData.assigneeId,
        due_by: formData.dueBy,
        number_in_series: formData.numberInSeries,
        category: formData.category.trim().toLowerCase(),
      },
    };
    try {
      const { data } = await axios.post(`/lists/${props.listId}/list_items`, postData);
      props.handleItemAddition(data);
      setFormData(defaultFormState);
      setPending(false);
      toast('Item successfully added.', { type: 'info' });
    } catch (err: any) {
      if (err?.response) {
        if (err?.response?.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(err?.response?.status)) {
          toast('List not found', { type: 'error' });
          props.navigate('/lists');
        } else {
          const responseTextKeys = Object.keys(err?.response.data);
          const responseErrors = responseTextKeys.map((key) => `${key} ${err?.response.data[key]}`);
          let joinString;
          if (props.listType === EListType.BOOK_LIST || props.listType === EListType.MUSIC_LIST) {
            joinString = ' or ';
          } else {
            joinString = ' and ';
          }
          toast(responseErrors.join(joinString), { type: 'error' });
        }
      } else if (err?.request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(err?.message, { type: 'error' });
      }
    }
  };

  return (
    <>
      {!showForm && (
        <>
          <Button
            variant="link"
            onClick={() => setShowForm(true)}
            aria-controls="form-collapse"
            aria-expanded={showForm}
          >
            Add Item
          </Button>
        </>
      )}
      <Collapse in={showForm}>
        <Form id="form-collapse" onSubmit={handleSubmit} autoComplete="off" data-test-id="list-item-form">
          <ListItemFormFields
            formData={formData}
            // TODO: pretty sure this is not what we want
            setFormData={setData as unknown as ChangeEventHandler}
            categories={props.categories ?? []}
            listType={props.listType}
            listUsers={props.listUsers ?? []}
          />
          <FormSubmission
            disabled={pending}
            submitText="Add New Item"
            cancelAction={() => setShowForm(false)}
            cancelText="Collapse Form"
            displayCancelButton={true}
          />
        </Form>
      </Collapse>
    </>
  );
};

export default ListItemForm;
