import React from 'react';
import PropTypes from 'prop-types';

const TextField = ({
  name,
  label,
  value,
  handleChange,
  placeholder,
}) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <input
      type="text"
      className="form-control"
      id={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
    />
  </div>
);

TextField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

TextField.defaultProps = {
  placeholder: '',
};

export default TextField;
