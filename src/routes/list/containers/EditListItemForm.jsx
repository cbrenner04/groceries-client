import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { listTypeToSnakeCase } from '../../../utils/format';
import axios from '../../../utils/api';
import ListItemFormFields from '../components/ListItemFormFields';
import { itemName } from '../utils';

function EditListItemForm(props) {
  const [item, setItem] = useState(props.item);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const putData = {
      [`${listTypeToSnakeCase(props.list.type)}_item`]: {
        user_id: props.userId,
        product: item.product,
        task: item.task,
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
        [`${listTypeToSnakeCase(props.list.type)}_id`]: props.list.id,
      },
    };
    try {
      await axios.put(
        `/lists/${props.list.id}/${listTypeToSnakeCase(props.list.type)}_items/${props.item.id}`,
        putData,
      );
      toast('Item successfully updated', { type: 'info' });
      props.history.push(`/lists/${props.list.id}`);
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.history.push('/users/sign_in');
        } else if ([403, 404].includes(response.status)) {
          toast('Item not found', { type: 'error' });
          props.history.push(`/lists/${props.list.id}`);
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
          setFormData={setItem}
          categories={props.list.categories}
          listType={props.list.type}
          listUsers={props.listUsers}
          editForm
        />
        <Button type="submit" variant="success" block>
          Update Item
        </Button>
        <Button href={`/lists/${props.list.id}`} variant="link" block>
          Cancel
        </Button>
      </Form>
    </>
  );
}

EditListItemForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  // fetch in parent component sets default values for these properties
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    product: PropTypes.string.isRequired,
    task: PropTypes.string.isRequired,
    purchased: PropTypes.bool.isRequired,
    quantity: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    author: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    read: PropTypes.bool.isRequired,
    artist: PropTypes.string.isRequired,
    dueBy: PropTypes.string.isRequired,
    assigneeId: PropTypes.string.isRequired,
    album: PropTypes.string.isRequired,
    numberInSeries: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
  }).isRequired,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  userId: PropTypes.number.isRequired,
};

export default EditListItemForm;
