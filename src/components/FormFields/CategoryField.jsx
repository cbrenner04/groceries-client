import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const CategoryField = ({ category, categories, handleInput, name, child, disabled }) => (
  <Form.Group controlId={name}>
    <Form.Label>Category</Form.Label>
    <Form.Control
      type="text"
      value={category}
      onChange={handleInput}
      list="categories"
      name={name}
      disabled={disabled}
    />
    <datalist id="categories">
      {categories.map((category) => (
        <option key={category} value={category} />
      ))}
    </datalist>
    {child}
  </Form.Group>
);

CategoryField.propTypes = {
  handleInput: PropTypes.func.isRequired,
  category: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string,
  child: PropTypes.node,
  disabled: PropTypes.bool,
};

CategoryField.defaultProps = {
  category: '',
  categories: [],
  name: 'category',
  child: '',
  disabled: false,
};

export default CategoryField;
