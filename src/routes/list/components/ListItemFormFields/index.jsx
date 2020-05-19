import React from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import Book from './Book';
import Grocery from './Grocery';
import Music from './Music';
import ToDo from './ToDo';
import { defaultDueBy } from '../../../../utils/format';

const ListItemFormFields = ({ categories, listType, listUsers, formData, setFormData, editForm = false }) => {
  const setData = ({ target: { name, value } }) => {
    const data = update(formData, { [name]: { $set: value } });
    setFormData(data);
  };

  return {
    BookList: (
      <Book
        author={formData.author}
        title={formData.title}
        numberInSeries={formData.numberInSeries}
        category={formData.category}
        categories={categories}
        inputChangeHandler={setData}
        read={formData.read}
        purchased={formData.purchased}
        editForm={editForm}
      />
    ),
    GroceryList: (
      <Grocery
        quantity={formData.quantity}
        product={formData.product}
        category={formData.category}
        categories={categories}
        inputChangeHandler={setData}
        purchased={formData.purchased}
        editForm={editForm}
      />
    ),
    MusicList: (
      <Music
        title={formData.title}
        artist={formData.artist}
        album={formData.album}
        category={formData.category}
        categories={categories}
        inputChangeHandler={setData}
        purchased={formData.purchased}
        editForm={editForm}
      />
    ),
    ToDoList: (
      <ToDo
        task={formData.task}
        assigneeId={formData.assigneeId}
        listUsers={listUsers}
        dueBy={formData.dueBy}
        category={formData.category}
        categories={categories}
        inputChangeHandler={setData}
        completed={formData.completed}
        editForm={editForm}
      />
    ),
  }[listType];
};

ListItemFormFields.propTypes = {
  listType: PropTypes.string.isRequired,
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      email: PropTypes.string.isRequired,
    }),
  ),
  categories: PropTypes.arrayOf(PropTypes.string),
  formData: PropTypes.shape({
    product: PropTypes.string,
    task: PropTypes.string,
    quantity: PropTypes.string,
    author: PropTypes.string,
    title: PropTypes.string,
    artist: PropTypes.string,
    album: PropTypes.string,
    assigneeId: PropTypes.string,
    dueBy: PropTypes.string,
    numberInSeries: PropTypes.number,
    category: PropTypes.string,
  }),
};

ListItemFormFields.defaultProps = {
  listUsers: [],
  categories: [],
  formData: {
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
    read: false,
    purchased: false,
    completed: false,
  },
};

export default ListItemFormFields;
