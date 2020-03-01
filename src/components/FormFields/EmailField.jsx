import React from 'react';
import PropTypes from 'prop-types';

const EmailField = ({
  name,
  label,
  value,
  handleChange,
}) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      type="email"
      name={name}
      className="form-control"
      value={value}
      onChange={handleChange}
      placeholder="jane.smith@example.com"
    />
  </div>
);

EmailField.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
};

EmailField.defaultProps = {
  name: 'email',
  label: 'Email',
};

export default EmailField;
