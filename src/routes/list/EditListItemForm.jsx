import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import * as $ from 'jquery';

import * as config from '../../config/default';
import { defaultDueBy, formatDueBy, listTypeToSnakeCase } from '../../utils/format';
import { setUserInfo } from '../../utils/auth';
import Alert from '../../components/Alert';
import BookListItemFormFields from './components/BookListItemFormFields';
import GroceryListItemFormFields from './components/GroceryListItemFormFields';
import MusicListItemFormFields from './components/MusicListItemFormFields';
import ToDoListItemFormFields from './components/ToDoListItemFormFields';

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
      $.ajax({
        type: 'GET',
        url: `${config.apiBase}/lists/${props.match.params.list_id}` +
             `/${props.match.params[0]}` +
             `/${props.match.params.id}/edit`,
        dataType: 'JSON',
        headers: JSON.parse(sessionStorage.getItem('user')),
      }).done((data, _status, request1) => {
        setUserInfo(request1);
        const { item, list } = data;
        const dueByDate = formatDueBy(item.due_by);
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
        $.ajax({
          type: 'GET',
          url: `${config.apiBase}/lists/${props.match.params.list_id}/users_lists`,
          dataType: 'JSON',
          headers: JSON.parse(sessionStorage.getItem('user')),
        }).done(({ accepted, pending, current_user_id: currentUserId }, _status, request2) => {
          setUserInfo(request2);
          const acceptedUsers = accepted.map(({ user }) => user);
          const pendingUsers = pending.map(({ user }) => user);
          const currentListUsers = acceptedUsers.concat(pendingUsers);
          const userInAccepted = accepted.find(acceptedList => acceptedList.user.id === currentUserId);
          if (userInAccepted && userInAccepted.users_list.permissions === 'write') {
            setListUsers(currentListUsers);
          } else {
            props.history.push('/lists');
          }
          $.ajax({
            type: 'GET',
            url: `${config.apiBase}/lists/${props.match.params.list_id}`,
            dataType: 'JSON',
            headers: JSON.parse(sessionStorage.getItem('user')),
          }).done((listData, _status, request3) => {
            setUserInfo(request3);
            setCategories(listData.categories);
          });
        });
      });
    }
  }, []);

  const handleSubmit = (event) => {
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
    $.ajax({
      url: `${config.apiBase}/lists/${listId}/${listTypeToSnakeCase(listType)}_items/${itemId}`,
      data: putData,
      method: 'PUT',
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).done((_data, _status, request) => {
      setUserInfo(request);
      props.history.push(`/lists/${listId}`);
    }).fail((response) => {
      const responseJSON = JSON.parse(response.responseText);
      const responseTextKeys = Object.keys(responseJSON);
      const responseErrors = responseTextKeys.map(key => `${key} ${responseJSON[key]}`);
      let joinString;
      if (listType === 'BookList' || listType === 'MusicList') {
        joinString = ' or ';
      } else {
        joinString = ' and ';
      }
      setErrors(responseErrors.join(joinString));
    });
  };

  const itemName = () => (
    {
      BookList: `${title ? `"${title}"` : ''} ${author}`,
      GroceryList: product,
      MusicList: `${
        title ? `"${title}"` : ''
      } ${
        artist
      } ${
        artist && album ? `- ${album || ''}` : ''
      }`,
      ToDoList: task,
    }[listType]
  );

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
    <div>
      <Alert errors={errors} handleDismiss={() => setErrors('')} />
      <h1>Edit { itemName() }</h1>
      <Link to={`/lists/${listId}`} className="pull-right">
        Back to list
      </Link>
      <br />
      <form onSubmit={handleSubmit} autoComplete="off">
        { formFields() }
        <button type="submit" className="btn btn-success btn-block">
          Update Item
        </button>
      </form>
    </div>
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
