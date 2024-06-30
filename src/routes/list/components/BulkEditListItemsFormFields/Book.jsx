import React from 'react';
import PropTypes from 'prop-types';

import { TextField } from '../../../../components/FormFields';

const Book = ({ author, clearAuthor, handleClearAuthor, handleInput }) => (
  <TextField
    name="author"
    label="Author"
    value={author}
    handleChange={handleInput}
    placeholder="Kurt Vonnagut"
    disabled={clearAuthor}
    showClear={true}
    clear={clearAuthor}
    handleClear={handleClearAuthor}
  />
);

Book.propTypes = {
  author: PropTypes.string.isRequired,
  clearAuthor: PropTypes.bool.isRequired,
  handleClearAuthor: PropTypes.func.isRequired,
  handleInput: PropTypes.func.isRequired,
};

export default Book;
