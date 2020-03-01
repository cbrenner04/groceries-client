import React from 'react';
import PropTypes from 'prop-types';

const PasswordField = ({
  name,
  label,
  value,
  handleChange,
  placeholder,
}) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input
      type="password"
      className="form-control"
      id={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete="off"
    />
  </div>
);

PasswordField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

PasswordField.defaultProps = {
  placeholder: '',
};

export default PasswordField;
