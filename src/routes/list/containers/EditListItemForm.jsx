import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

import { listTypeToSnakeCase } from '../../../utils/format';
import Alert from '../../../components/Alert';
import axios from '../../../utils/api';
import ListItemFormFields from '../components/ListItemFormFields';
import { itemName } from '../utils';

function EditListItemForm(props) {
  const [errors, setErrors] = useState('');
  const [item, setItem] = useState(props.item);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors('');
    const listItem = {
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
    };
    listItem[`${listTypeToSnakeCase(props.list.type)}_id`] = props.list.id;
    const putData = {};
    putData[`${listTypeToSnakeCase(props.list.type)}_item`] = listItem;
    try {
      await axios.put(
        `/lists/${props.list.id}/${listTypeToSnakeCase(props.list.type)}_items/${props.item.id}`,
        putData,
      );
      props.history.push({
        pathname: `/lists/${props.list.id}`,
        state: { success: 'Item successfully updated' },
      });
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          props.history.push({
            pathname: '/users/sign_in',
            state: { errors: 'You must sign in' },
          });
        } else if ([403, 404].includes(response.status)) {
          props.history.push({
            pathname: `/lists/${props.list.id}`,
            state: { errors: 'Item not found' },
          });
        } else {
          const keys = Object.keys(response.data);
          const responseErrors = keys.map((key) => `${key} ${response.data[key]}`);
          let joinString;
          if (props.list.type === 'BookList' || props.list.type === 'MusicList') {
            joinString = ' or ';
          } else {
            joinString = ' and ';
          }
          setErrors(responseErrors.join(joinString));
        }
      } else if (request) {
        setErrors('Something went wrong');
      } else {
        setErrors(message);
      }
    }
  };

  return (
    <>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <h1>Edit {itemName(item, props.list.type)}</h1>
      <Button href={`/lists/${props.list.id}`} className="float-right" variant="link">
        Back to list
      </Button>
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
      </Form>
    </>
  );
}

EditListItemForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      email: PropTypes.string,
    }),
  ),
  item: PropTypes.shape({
    id: PropTypes.number,
    product: PropTypes.string,
    task: PropTypes.string,
    purchased: PropTypes.bool,
    quantity: PropTypes.string,
    completed: PropTypes.bool,
    author: PropTypes.string,
    title: PropTypes.string,
    read: PropTypes.bool,
    artist: PropTypes.string,
    dueBy: PropTypes.string,
    assigneeId: PropTypes.string,
    album: PropTypes.string,
    numberInSeries: PropTypes.number,
    category: PropTypes.string,
  }),
  list: PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
  }),
  userId: PropTypes.number,
};

export default EditListItemForm;
