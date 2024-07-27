import React, { type ChangeEventHandler } from 'react';

import { TextField, CategoryField, CheckboxField } from 'components/FormFields';

export interface IMusicFormFieldsProps {
  title: string;
  artist: string;
  album: string;
  purchased?: boolean;
  editForm?: boolean;
  category?: string;
  categories?: string[];
  inputChangeHandler: ChangeEventHandler;
}

const MusicFormFields: React.FC<IMusicFormFieldsProps> = ({
  title,
  artist,
  album,
  inputChangeHandler,
  purchased = false,
  editForm = false,
  category = '',
  categories = [],
}) => (
  <React.Fragment>
    <TextField name="title" label="Title" value={title} handleChange={inputChangeHandler} placeholder="Baby Got Back" />
    <TextField
      name="artist"
      label="Artist"
      value={artist}
      handleChange={inputChangeHandler}
      placeholder="Sir Mix-a-Lot"
    />
    <TextField name="album" label="Album" value={album} handleChange={inputChangeHandler} placeholder="Mack Daddy" />
    <CategoryField category={category} categories={categories} handleInput={inputChangeHandler} />
    {editForm && (
      <CheckboxField
        name="purchased"
        label="Purchased"
        value={purchased}
        handleChange={inputChangeHandler}
        classes="mb-3"
      />
    )}
  </React.Fragment>
);

export default MusicFormFields;
