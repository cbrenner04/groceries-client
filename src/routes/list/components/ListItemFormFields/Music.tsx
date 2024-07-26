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

const MusicFormFields: React.FC<IMusicFormFieldsProps> = (props) => (
  <React.Fragment>
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
      category={props.category ?? ''}
      categories={props.categories ?? []}
      handleInput={props.inputChangeHandler}
    />
    {props.editForm && (
      <CheckboxField
        name="purchased"
        label="Purchased"
        value={props.purchased ?? false}
        handleChange={props.inputChangeHandler}
        classes="mb-3"
      />
    )}
  </React.Fragment>
);

export default MusicFormFields;
