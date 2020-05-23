import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { defaultDueBy, listTypeToSnakeCase } from '../../../utils/format';
import ListItemFormFields from './ListItemFormFields';
import axios from '../../../utils/api';

const defaultFormState = {
  product: '',
  task: '',
  quantity: '',
  author: '',
  title: '',
  artist: '',
  album: '',
  assigneeId: '',
  dueBy: defaultDueBy(),
  numberInSeries: 0,
  category: '',
};

function ListItemForm(props) {
  const [formData, setFormData] = useState(defaultFormState);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const requestListType = listTypeToSnakeCase(props.listType);
    const postData = {
      [`${requestListType}_item`]: {
        user_id: props.userId,
        product: formData.product,
        task: formData.task,
        quantity: formData.quantity,
        author: formData.author,
        title: formData.title,
        artist: formData.artist,
        album: formData.album,
        assignee_id: formData.assigneeId,
        due_by: formData.dueBy,
        number_in_series: formData.numberInSeries || null,
        category: formData.category.trim().toLowerCase(),
        [`${requestListType}_id`]: props.listId,
      },
    };
    try {
      const { data } = await axios.post(`/lists/${props.listId}/${requestListType}_items`, postData);
      props.handleItemAddition(data);
      setFormData(defaultFormState);
      toast('Item successfully added.', { type: 'info' });
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          toast('You must sign in', { type: 'error' });
          props.history.push('/users/sign_in');
        } else if ([403, 404].includes(response.status)) {
          toast('List not found', { type: 'error' });
          props.history.push('/lists');
        } else {
          const responseTextKeys = Object.keys(response.data);
          const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
          let joinString;
          if (props.listType === 'BookList' || props.listType === 'MusicList') {
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
      <Form onSubmit={handleSubmit} autoComplete="off">
        <ListItemFormFields
          formData={formData}
          setFormData={setFormData}
          categories={props.categories}
          listType={props.listType}
          listUsers={props.listUsers}
        />
        <br />
        <Button type="submit" variant="success" block>
          Add New Item
        </Button>
      </Form>
    </>
  );
}

ListItemForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.number.isRequired,
  listId: PropTypes.number.isRequired,
  listType: PropTypes.string.isRequired,
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
    }),
  ),
  handleItemAddition: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string),
};

ListItemForm.defaultProps = {
  listUsers: [],
  categories: [],
};

export default ListItemForm;
