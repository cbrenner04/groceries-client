import React from 'react';
import PropTypes from 'prop-types';

const DateField = ({
  name,
  label,
  value,
  handleChange,
  placeholder,
}) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input
      type="date"
      className="form-control"
      id={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
    />
  </div>
);

DateField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

DateField.defaultProps = {
  placeholder: '',
};

export default DateField;
