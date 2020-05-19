import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const CategoryField = ({ category, categories, handleInput, name }) => (
  <Form.Group controlId="category">
    <Form.Label>Category</Form.Label>
    <Form.Control type="text" value={category} onChange={handleInput} list="categories" name={name} />
    <datalist id="categories">
      {categories.map((category) => (
        <option key={category} value={category} />
      ))}
    </datalist>
  </Form.Group>
);

CategoryField.propTypes = {
  handleInput: PropTypes.func.isRequired,
  category: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string,
};

CategoryField.defaultProps = {
  category: '',
  categories: [],
  name: 'category',
};

export default CategoryField;
