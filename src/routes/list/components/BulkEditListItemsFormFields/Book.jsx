import React from 'react';
import PropTypes from 'prop-types';

import { CheckboxField, TextField } from '../../../../components/FormFields';

const Book = ({ author, clearAuthor, handleClearAuthor, handleInput }) => (
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
        classes="ml-1 mt-1"
      />
    }
  />
);

Book.propTypes = {
  author: PropTypes.string.isRequired,
  clearAuthor: PropTypes.bool.isRequired,
  handleClearAuthor: PropTypes.func.isRequired,
  handleInput: PropTypes.func.isRequired,
};

export default Book;
