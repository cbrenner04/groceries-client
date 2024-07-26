import React, { type ChangeEventHandler } from 'react';

import { CheckboxField, TextField } from 'components/FormFields';

export interface IBookProps {
  author: string;
  clearAuthor: boolean;
  handleClearAuthor: ChangeEventHandler;
  handleInput: ChangeEventHandler;
}

const Book: React.FC<IBookProps> = ({ author, clearAuthor, handleClearAuthor, handleInput }): React.JSX.Element => (
  <TextField
    name="author"
    label="Author"
    value={author}
    handleChange={handleInput}
    placeholder="Kurt Vonnagut"
    disabled={clearAuthor}
    child={
      <CheckboxField
        name="clearAuthor"
        label="Clear author"
        handleChange={handleClearAuthor}
        value={clearAuthor}
        classes="ms-1 mt-1"
      />
    }
  />
);

export default Book;
