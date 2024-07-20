import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';

import { list, listItem, listUsers } from '../../../types';
import axios from '../../../utils/api';
import ListItemFormFields from '../components/ListItemFormFields';
import { itemName } from '../utils';
import FormSubmission from '../../../components/FormSubmission';

function EditListItemForm(props) {
  const [item, setItem] = useState(props.item);
  const setData = ({ target: { name, value } }) => {
    let newValue = value;
    /* istanbul ignore else */
    if (name === 'numberInSeries') {
      newValue = Number(value);
    }
    const data = update(item, { [name]: { $set: newValue } });
    setItem(data);
  };

  const handleSubmit = async (event) => {
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
        due_by: item.dueBy,
        assignee_id: item.assigneeId,
        number_in_series: item.numberInSeries,
        category: item.category.trim().toLowerCase(),
        list_id: props.list.id,
      },
    };
    try {
      await axios.put(`/lists/${props.list.id}/list_items/${props.item.id}`, putData);
      toast('Item successfully updated', { type: 'info' });
      props.navigate(`/lists/${props.list.id}`);
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.navigate('/users/sign_in');
        } else if ([403, 404].includes(response.status)) {
          toast('Item not found', { type: 'error' });
          props.navigate(`/lists/${props.list.id}`);
        } else {
          const keys = Object.keys(response.data);
          const responseErrors = keys.map((key) => `${key} ${response.data[key]}`);
          let joinString;
          if (props.list.type === 'BookList' || props.list.type === 'MusicList') {
            joinString = ' or ';
          } else {
            joinString = ' and ';
          }
          toast(responseErrors.join(joinString), { type: 'error' });
        }
      } else if (request) {
        toast('Something went wrong', { type: 'error' });
      } else {
        toast(message, { type: 'error' });
      }
    }
  };

  return (
    <>
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
          cancelAction={() => props.navigate(`/lists/${props.list.id}`)}
          cancelText="Cancel"
          displayCancelButton={true}
        />
      </Form>
    </>
  );
}

EditListItemForm.propTypes = {
  navigate: PropTypes.func.isRequired,
  listUsers: PropTypes.arrayOf(listUsers).isRequired,
  item: listItem.isRequired,
  list: list.isRequired,
  userId: PropTypes.string.isRequired,
};

export default EditListItemForm;
