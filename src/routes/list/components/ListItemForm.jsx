import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

import { defaultDueBy, listTypeToSnakeCase } from '../../../utils/format';
import Alert from '../../../components/Alert';
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
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');

  const dismissAlert = () => {
    setErrors('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dismissAlert();
    const listItem = {
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
    };
    listItem[`${listTypeToSnakeCase(props.listType)}_id`] = props.listId;
    const postData = {};
    postData[`${listTypeToSnakeCase(props.listType)}_item`] = listItem;
    try {
      const { data } = await axios.post(
        `/lists/${props.listId}/${listTypeToSnakeCase(props.listType)}_items`,
        postData,
      );
      props.handleItemAddition(data);
      setFormData(defaultFormState);
      setSuccess('Item successfully added.');
    } catch ({ response, request, message }) {
      if (response) {
        if (response.status === 401) {
          props.history.push({
            pathname: '/users/sign_in',
            state: { errors: 'You must sign in' },
          });
        } else if ([403, 404].includes(response.status)) {
          props.history.push({
            pathname: '/lists',
            state: { errors: 'List not found' },
          });
        } else {
          const responseTextKeys = Object.keys(response.data);
          const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
          let joinString;
          if (props.listType === 'BookList' || props.listType === 'MusicList') {
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
    <div>
      <Alert errors={errors} success={success} handleDismiss={dismissAlert} />
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
    </div>
  );
}

ListItemForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
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
