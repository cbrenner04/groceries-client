import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

import { defaultDueBy, listTypeToSnakeCase } from '../../../utils/format';
import Alert from '../../../components/Alert';
import BookListItemFormFields from './BookListItemFormFields';
import GroceryListItemFormFields from './GroceryListItemFormFields';
import MusicListItemFormFields from './MusicListItemFormFields';
import ToDoListItemFormFields from './ToDoListItemFormFields';
import axios from '../../../utils/api';

function ListItemForm(props) {
  const [product, setProduct] = useState('');
  const [task, setTask] = useState('');
  const [quantity, setQuantity] = useState('');
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueBy, setDueBy] = useState(defaultDueBy());
  const [numberInSeries, setNumberInSeries] = useState(0);
  const [category, setCategory] = useState('');
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
      product,
      task,
      quantity,
      author,
      title,
      artist,
      album,
      assignee_id: assigneeId,
      due_by: dueBy,
      number_in_series: numberInSeries || null,
      category: category.trim().toLowerCase(),
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
      setProduct('');
      setTask('');
      setQuantity('');
      setAuthor('');
      setTitle('');
      setArtist('');
      setAlbum('');
      setAssigneeId('');
      setDueBy(defaultDueBy());
      setNumberInSeries(0);
      setCategory('');
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

  const formFields = () => {
    if (props.listType === 'BookList') {
      return (
        <BookListItemFormFields
          author={author}
          authorChangeHandler={({ target: { value } }) => setAuthor(value)}
          title={title}
          titleChangeHandler={({ target: { value } }) => setTitle(value)}
          numberInSeries={numberInSeries}
          numberInSeriesChangeHandler={({ target: { value } }) => setNumberInSeries(Number(value))}
          category={category}
          categoryChangeHandler={({ target: { value } }) => setCategory(value)}
          categories={props.categories}
        />
      );
    } else if (props.listType === 'GroceryList') {
      return (
        <GroceryListItemFormFields
          quantity={quantity}
          quantityChangeHandler={({ target: { value } }) => setQuantity(value)}
          product={product}
          productChangeHandler={({ target: { value } }) => setProduct(value)}
          category={category}
          categoryChangeHandler={({ target: { value } }) => setCategory(value)}
          categories={props.categories}
        />
      );
    } else if (props.listType === 'MusicList') {
      return (
        <MusicListItemFormFields
          title={title}
          titleChangeHandler={({ target: { value } }) => setTitle(value)}
          artist={artist}
          artistChangeHandler={({ target: { value } }) => setArtist(value)}
          album={album}
          albumChangeHandler={({ target: { value } }) => setAlbum(value)}
          category={category}
          categoryChangeHandler={({ target: { value } }) => setCategory(value)}
          categories={props.categories}
        />
      );
    } else if (props.listType === 'ToDoList') {
      return (
        <ToDoListItemFormFields
          task={task}
          taskChangeHandler={({ target: { value } }) => setTask(value)}
          assigneeId={assigneeId}
          assigneeIdChangeHandler={({ target: { value } }) => setAssigneeId(value)}
          listUsers={props.listUsers}
          dueBy={dueBy}
          dueByChangeHandler={({ target: { value } }) => setDueBy(value)}
          category={category}
          categoryChangeHandler={({ target: { value } }) => setCategory(value)}
          categories={props.categories}
        />
      );
    }
    return '';
  };

  return (
    <div>
      <Alert errors={errors} success={success} handleDismiss={dismissAlert} />
      <Form onSubmit={handleSubmit} autoComplete="off">
        {formFields()}
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
