import React from 'react';
import PropTypes from 'prop-types';

const NumberField = ({
  name,
  label,
  value,
  handleChange,
}) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input
      type="number"
      className="form-control"
      id={name}
      value={value || ''}
      onChange={handleChange}
    />
  </div>
);

NumberField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  handleChange: PropTypes.func.isRequired,
};

NumberField.defaultProps = {
  value: 0,
};

export default NumberField;
