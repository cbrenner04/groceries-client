import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const CategoryField = (props) => (
  <Form.Group controlId="category">
    <Form.Label>Category</Form.Label>
    <Form.Control type="text" value={props.category} onChange={props.handleInput} list="categories" />
    <datalist id="categories">
      {props.categories.map((category) => (
        <option key={category} value={category} />
      ))}
    </datalist>
  </Form.Group>
);

CategoryField.propTypes = {
  handleInput: PropTypes.func.isRequired,
  category: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
};

CategoryField.defaultProps = {
  category: '',
  categories: [],
};

export default CategoryField;
