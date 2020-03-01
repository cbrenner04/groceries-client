import React from 'react';
import PropTypes from 'prop-types';

const CategoryField = props => (
  <div className="form-group">
    <label htmlFor="category">Category</label>
    <input
      name="category"
      type="text"
      className="form-control"
      id="category"
      value={props.category}
      onChange={props.handleInput}
      list="categories"
    />
    <datalist id="categories">
      {props.categories.map(category => <option key={category} value={category} />)}
    </datalist>
  </div>
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
