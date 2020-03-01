import React from 'react';
import PropTypes from 'prop-types';

import { TextField, CategoryField, CheckboxField } from '../../../components/FormFields';

const EditMusicListItemFormFields = props => (
  <div>
    <TextField
      name="title"
      label="Title"
      value={props.title}
      handleChange={props.titleChangeHandler}
      placeholder="Baby Got Back"
    />
    <TextField
      name="artist"
      label="Artist"
      value={props.artist}
      handleChange={props.artistChangeHandler}
      placeholder="Sir Mix-a-Lot"
    />
    <TextField
      name="album"
      label="Album"
      value={props.album}
      handleChange={props.albumChangeHandler}
      placeholder="Mack Daddy"
    />
    <CategoryField category={props.category} categories={props.categories} handleInput={props.categoryChangeHandler} />
    {
      props.editForm && (
        <CheckboxField
          name="purchased"
          label="Purchased"
          value={props.purchased}
          handleChange={props.purchasedChangeHandler}
          classes="mb-3"
        />
      )
    }
  </div>
);

EditMusicListItemFormFields.propTypes = {
  title: PropTypes.string.isRequired,
  titleChangeHandler: PropTypes.func.isRequired,
  artist: PropTypes.string.isRequired,
  artistChangeHandler: PropTypes.func.isRequired,
  album: PropTypes.string.isRequired,
  albumChangeHandler: PropTypes.func.isRequired,
  purchased: PropTypes.bool,
  purchasedChangeHandler: PropTypes.func,
  editForm: PropTypes.bool,
  category: PropTypes.string,
  categoryChangeHandler: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string),
};

EditMusicListItemFormFields.defaultProps = {
  purchased: false,
  editForm: false,
  category: '',
  categories: [],
  purchasedChangeHandler: () => {},
};

export default EditMusicListItemFormFields;
