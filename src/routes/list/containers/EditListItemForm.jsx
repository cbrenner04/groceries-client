import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import update from 'immutability-helper';

import { listTypeToSnakeCase } from '../../../utils/format';
import { setUserInfo } from '../../../utils/auth';
import Alert from '../../../components/Alert';
import BookListItemFormFields from '../components/BookListItemFormFields';
import GroceryListItemFormFields from '../components/GroceryListItemFormFields';
import MusicListItemFormFields from '../components/MusicListItemFormFields';
import ToDoListItemFormFields from '../components/ToDoListItemFormFields';
import axios from '../../../utils/api';

function EditListItemForm(props) {
  const [errors, setErrors] = useState('');
  const [item, setItem] = useState(props.item);

  const handleSubmit = async event => {
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
      const { headers } = await axios.put(
        `/lists/${props.list.id}/${listTypeToSnakeCase(props.list.type)}_items/${props.item.id}`,
        putData,
        {
          headers: JSON.parse(sessionStorage.getItem('user')),
        },
      );
      setUserInfo(headers);
      // TODO: pass success message
      props.history.push(`/lists/${props.list.id}`);
    } catch ({ response, request, message }) {
      if (response) {
        setUserInfo(response.headers);
        if (response.status === 401) {
          // TODO: how do we pass error messages along?
          props.history.push('/users/sign_in');
        } else if (response.status === 403) {
          // TODO: how do we pass error messages along?
          props.history.push(`/lists/${props.list.id}`);
        } else {
          const keys = Object.keys(response.data);
          const responseErrors = keys.map(key => `${key} ${response.data[key]}`);
          let joinString;
          if (props.list.type === 'BookList' || props.list.type === 'MusicList') {
            joinString = ' or ';
          } else {
            joinString = ' and ';
          }
          setErrors(responseErrors.join(joinString));
        }
      } else if (request) {
        // TODO: what do here?
      } else {
        setErrors(message);
      }
    }
  };

  const itemName = () =>
    ({
      BookList: `${item.title ? `"${item.title}"` : ''} ${item.author}`,
      GroceryList: item.product,
      MusicList: `${item.title ? `"${item.title}"` : ''} ${item.artist} ${
        item.artist && item.album ? `- ${item.album || ''}` : ''
      }`,
      ToDoList: item.task,
    }[props.list.type]);

  const setItemProperty = (property, value) => {
    const newItem = update(item, { [property]: { $set: value } });
    setItem(newItem);
  };

  const categoryChangeHandler = ({ target: { value } }) => setItemProperty('category', value);

  const formFields = () => {
    if (props.list.type === 'BookList') {
      return (
        <BookListItemFormFields
          author={item.author}
          authorChangeHandler={({ target: { value } }) => setItemProperty('author', value)}
          title={item.title}
          titleChangeHandler={({ target: { value } }) => setItemProperty('title', value)}
          purchased={item.purchased}
          purchasedChangeHandler={() => setItemProperty('purchased', !item.purchased)}
          read={item.read}
          readChangeHandler={() => setItemProperty('read', !item.read)}
          numberInSeries={item.numberInSeries}
          numberInSeriesChangeHandler={({ target: { value } }) => setItemProperty('numberInSeries', Number(value))}
          category={item.category}
          categoryChangeHandler={categoryChangeHandler}
          categories={props.list.categories}
          editForm
        />
      );
    } else if (props.list.type === 'GroceryList') {
      return (
        <GroceryListItemFormFields
          product={item.product}
          productChangeHandler={({ target: { value } }) => setItemProperty('product', value)}
          quantity={item.quantity}
          quantityChangeHandler={({ target: { value } }) => setItemProperty('quantity', value)}
          purchased={item.purchased}
          purchasedChangeHandler={() => setItemProperty('purchased', !item.purchased)}
          category={item.category}
          categoryChangeHandler={categoryChangeHandler}
          categories={props.list.categories}
          editForm
        />
      );
    } else if (props.list.type === 'MusicList') {
      return (
        <MusicListItemFormFields
          title={item.title}
          titleChangeHandler={({ target: { value } }) => setItemProperty('title', value)}
          artist={item.artist}
          artistChangeHandler={({ target: { value } }) => setItemProperty('artist', value)}
          album={item.album}
          albumChangeHandler={({ target: { value } }) => setItemProperty('album', value)}
          purchased={item.purchased}
          purchasedChangeHandler={() => setItemProperty('purchased', !item.purchased)}
          category={item.category}
          categoryChangeHandler={categoryChangeHandler}
          categories={props.list.categories}
          editForm
        />
      );
    } else if (props.list.type === 'ToDoList') {
      return (
        <ToDoListItemFormFields
          task={item.task}
          taskChangeHandler={({ target: { value } }) => setItemProperty('task', value)}
          assigneeId={item.assigneeId}
          assigneeIdChangeHandler={({ target: { value } }) => setItemProperty('assigneeId', value)}
          dueBy={item.dueBy}
          dueByChangeHandler={({ target: { value } }) => setItemProperty('dueBy', value)}
          completed={item.completed}
          completedChangeHandler={() => setItemProperty('completed', !item.completed)}
          listUsers={props.listUsers}
          category={item.category}
          categoryChangeHandler={categoryChangeHandler}
          categories={props.list.categories}
          editForm
        />
      );
    }
    return '';
  };

  return (
    <>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <h1>Edit {itemName()}</h1>
      <Button href={`/lists/${props.list.id}`} className="float-right" variant="link">
        Back to list
      </Button>
      <br />
      <Form onSubmit={handleSubmit} autoComplete="off">
        {formFields()}
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
