import React from 'react';
import PropTypes from 'prop-types';

import { TextField, CategoryField, CheckboxField } from '../../../../components/FormFields';

const MusicFormFields = (props) => (
  <>
    <TextField
      name="title"
      label="Title"
      value={props.title}
      handleChange={props.inputChangeHandler}
      placeholder="Baby Got Back"
    />
    <TextField
      name="artist"
      label="Artist"
      value={props.artist}
      handleChange={props.inputChangeHandler}
      placeholder="Sir Mix-a-Lot"
    />
    <TextField
      name="album"
      label="Album"
      value={props.album}
      handleChange={props.inputChangeHandler}
      placeholder="Mack Daddy"
    />
    <CategoryField
      category={props.category || ''}
      categories={props.categories || []}
      handleInput={props.inputChangeHandler}
    />
    {props.editForm && (
      <CheckboxField
        name="purchased"
        label="Purchased"
        value={props.purchased || false}
        handleChange={props.inputChangeHandler}
        classes="mb-3"
      />
    )}
  </>
);

MusicFormFields.propTypes = {
  title: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  album: PropTypes.string.isRequired,
  purchased: PropTypes.bool,
  editForm: PropTypes.bool,
  category: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
  inputChangeHandler: PropTypes.func.isRequired,
};

export default MusicFormFields;
