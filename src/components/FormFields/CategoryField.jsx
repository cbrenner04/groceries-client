import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

import { CheckboxField } from '../../components/FormFields';

const CategoryField = ({
  category,
  categories,
  handleInput,
  showClearCategory,
  clearCategory,
  handleClearCategory,
  disabled,
}) => (
  <Form.Group controlId="category" className="mb-3">
    <Form.Label>Category</Form.Label>
    <Form.Control
      type="text"
      value={category}
      onChange={handleInput}
      list="categories"
      name="category"
      disabled={disabled}
    />
    <datalist id="categories">
      {(categories || []).map((category) => (
        <option key={category} value={category} />
      ))}
    </datalist>
    {showClearCategory && (
      <CheckboxField
        name="clearCategory"
        label="Clear category"
        handleChange={handleClearCategory}
        value={clearCategory}
        classes="ms-1 mt-1"
      />
    )}
  </Form.Group>
);

CategoryField.propTypes = {
  handleInput: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool.isRequired,
  showClearCategory: PropTypes.bool.isRequired,
  clearCategory: PropTypes.bool.isRequired,
  handleClearCategory: PropTypes.func.isRequired,
};

export default CategoryField;
