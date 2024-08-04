import React, { type ChangeEventHandler } from 'react';

import { CheckboxField, TextField } from 'components/FormFields';

export interface IBookProps {
  author: string;
  clearAuthor: boolean;
  handleClearAuthor: ChangeEventHandler;
  handleInput: ChangeEventHandler;
}

const Book: React.FC<IBookProps> = (props): React.JSX.Element => (
  <TextField
    name="author"
    label="Author"
    value={props.author}
    handleChange={props.handleInput}
    placeholder="Kurt Vonnagut"
    disabled={props.clearAuthor}
    child={
      <CheckboxField
        name="clearAuthor"
        label="Clear author"
        handleChange={props.handleClearAuthor}
        value={props.clearAuthor}
        classes="ms-1 mt-1"
      />
    }
  />
);

export default Book;
