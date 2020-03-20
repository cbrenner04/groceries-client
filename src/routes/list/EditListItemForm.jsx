import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';

import { defaultDueBy, formatDueBy, listTypeToSnakeCase } from '../../utils/format';
import { setUserInfo } from '../../utils/auth';
import Alert from '../../components/Alert';
import BookListItemFormFields from './components/BookListItemFormFields';
import GroceryListItemFormFields from './components/GroceryListItemFormFields';
import MusicListItemFormFields from './components/MusicListItemFormFields';
import ToDoListItemFormFields from './components/ToDoListItemFormFields';
import axios from '../../utils/api';

function EditListItemForm(props) {
  const [userId, setUserId] = useState(0);
  const [listId, setListId] = useState(0);
  const [itemId, setItemId] = useState(0);
  const [listType, setListType] = useState('GroceryList');
  const [listUsers, setListUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState('');
  const [product, setProduct] = useState('');
  const [task, setTask] = useState('');
  const [purchased, setPurchased] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [completed, setCompleted] = useState(false);
  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [read, setRead] = useState(false);
  const [artist, setArtist] = useState('');
  const [dueBy, setDueBy] = useState(defaultDueBy());
  const [assigneeId, setAssigneeId] = useState('');
  const [album, setAlbum] = useState('');
  const [numberInSeries, setNumberInSeries] = useState(0);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (props.match) {
      const { id, list_id } = props.match.params;
      const failure = ({ response, request, message }) => {
        if (response) {
          setUserInfo(response.headers);
          if (response.status === 401) {
            // TODO: how do we pass error messages along?
            props.history.push('/users/sign_in');
          } else {
            // TODO: how do we pass error messages along?
            props.history.push(`/lists/${list_id}`);
          }
        } else if (request) {
          // TODO: what do here?
        } else {
          setErrors(message);
        }
      };
      const headers = JSON.parse(sessionStorage.getItem('user'));
      Promise.all([
        axios.get(`/lists/${list_id}/${props.match.params[0]}/${id}/edit`, { headers }).catch(failure),
        axios.get(`/lists/${list_id}/users_lists`, { headers }).catch(failure),
        axios.get(`/lists/${list_id}`, { headers }).catch(failure),
      ]).then(([editListResponse, usersListsResponse, listResponse]) => {
        setUserInfo(editListResponse.headers);
        const {
          data: { item, list },
        } = editListResponse;
        const {
          data: { accepted, pending, current_user_id: currentUserId },
        } = usersListsResponse;
        const {
          data: { categories },
        } = listResponse;
        const dueByDate = formatDueBy(item.due_by);
        const acceptedUsers = accepted.map(({ user }) => user);
        const pendingUsers = pending.map(({ user }) => user);
        const currentListUsers = acceptedUsers.concat(pendingUsers);
        const userInAccepted = accepted.find(acceptedList => acceptedList.user.id === currentUserId);
        if (userInAccepted && userInAccepted.users_list.permissions === 'write') {
          setListUsers(currentListUsers);
        } else {
          // TODO: how do we pass errors around?
          props.history.push('/lists');
        }
        setUserId(item.user_id);
        setListId(list.id);
        setListType(list.type);
        setItemId(item.id);
        setProduct(item.product);
        setTask(item.task);
        setPurchased(item.purchased);
        setQuantity(item.quantity);
        setCompleted(item.completed);
        setAuthor(item.author);
        setTitle(item.title);
        setRead(item.read);
        setArtist(item.artist);
        setDueBy(dueByDate);
        setAssigneeId(item.assignee_id ? String(item.assignee_id) : '');
        setAlbum(item.album);
        setNumberInSeries(Number(item.number_in_series));
        setCategory(item.category || '');
        setCategories(categories);
      });
    }
  }, [props.history, props.match]);

  const handleSubmit = async event => {
    event.preventDefault();
    setErrors('');
    const listItem = {
      user_id: userId,
      product,
      task,
      quantity,
      purchased,
      completed,
      author,
      title,
      read,
      artist,
      album,
      due_by: dueBy,
      assignee_id: assigneeId,
      number_in_series: numberInSeries,
      category: category.trim().toLowerCase(),
    };
    listItem[`${listTypeToSnakeCase(listType)}_id`] = listId;
    const putData = {};
    putData[`${listTypeToSnakeCase(listType)}_item`] = listItem;
    try {
      const { headers } = await axios.put(
        `/lists/${listId}/${listTypeToSnakeCase(listType)}_items/${itemId}`,
        putData,
        {
          headers: JSON.parse(sessionStorage.getItem('user')),
        },
      );
      setUserInfo(headers);
      // TODO: pass success message
      props.history.push(`/lists/${listId}`);
    } catch ({ response, request, message }) {
      if (response) {
        setUserInfo(response.headers);
        if (response.status === 401) {
          // TODO: how do we pass error messages along?
          props.history.push('/users/sign_in');
        } else if (response.status === 403) {
          // TODO: how do we pass error messages along?
          props.history.push(`/lists/${listId}`);
        } else {
          const keys = Object.keys(response.data);
          const responseErrors = keys.map(key => `${key} ${response.data[key]}`);
          let joinString;
          if (listType === 'BookList' || listType === 'MusicList') {
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
      BookList: `${title ? `"${title}"` : ''} ${author}`,
      GroceryList: product,
      MusicList: `${title ? `"${title}"` : ''} ${artist} ${artist && album ? `- ${album || ''}` : ''}`,
      ToDoList: task,
    }[listType]);

  const formFields = () => {
    if (listType === 'BookList') {
      return (
        <BookListItemFormFields
          author={author}
          authorChangeHandler={({ target: { value } }) => setAuthor(value)}
          title={title}
          titleChangeHandler={({ target: { value } }) => setTitle(value)}
          purchased={purchased}
          purchasedChangeHandler={() => setPurchased(!purchased)}
          read={read}
          readChangeHandler={() => setRead(!read)}
          numberInSeries={numberInSeries}
          numberInSeriesChangeHandler={({ target: { value } }) => setNumberInSeries(Number(value))}
          category={category}
          categoryChangeHandler={({ target: { value } }) => setCategory(value)}
          categories={categories}
          editForm
        />
      );
    } else if (listType === 'GroceryList') {
      return (
        <GroceryListItemFormFields
          product={product}
          productChangeHandler={({ target: { value } }) => setProduct(value)}
          quantity={quantity}
          quantityChangeHandler={({ target: { value } }) => setQuantity(value)}
          purchased={purchased}
          purchasedChangeHandler={() => setPurchased(!purchased)}
          category={category}
          categoryChangeHandler={({ target: { value } }) => setCategory(value)}
          categories={categories}
          editForm
        />
      );
    } else if (listType === 'MusicList') {
      return (
        <MusicListItemFormFields
          title={title}
          titleChangeHandler={({ target: { value } }) => setTitle(value)}
          artist={artist}
          artistChangeHandler={({ target: { value } }) => setArtist(value)}
          album={album}
          albumChangeHandler={({ target: { value } }) => setAlbum(value)}
          purchased={purchased}
          purchasedChangeHandler={() => setPurchased(!purchased)}
          category={category}
          categoryChangeHandler={({ target: { value } }) => setCategory(value)}
          categories={categories}
          editForm
        />
      );
    } else if (listType === 'ToDoList') {
      return (
        <ToDoListItemFormFields
          task={task}
          taskChangeHandler={({ target: { value } }) => setTask(value)}
          assigneeId={assigneeId}
          assigneeIdChangeHandler={({ target: { value } }) => setAssigneeId(value)}
          dueBy={dueBy}
          dueByChangeHandler={({ target: { value } }) => setDueBy(value)}
          completed={completed}
          completedChangeHandler={() => setCompleted(!completed)}
          listUsers={listUsers}
          category={category}
          categoryChangeHandler={({ target: { value } }) => setCategory(value)}
          categories={categories}
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
      <Button href={`/lists/${listId}`} className="float-right" variant="link">
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
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      list_id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default EditListItemForm;
