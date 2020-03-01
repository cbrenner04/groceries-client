import React from 'react';
import PropTypes from 'prop-types';

const CheckboxField = ({
  name,
  label,
  value,
  handleChange,
  classes,
}) => (
  <div className={`form-check ${classes}`}>
    <input
      className="form-check-input"
      id={name}
      type="checkbox"
      checked={value}
      onChange={handleChange}
    />
    <label className="form-check-label" htmlFor={name}>
      {label}
    </label>
  </div>
);

CheckboxField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.bool,
  handleChange: PropTypes.func.isRequired,
  classes: PropTypes.string,
};

CheckboxField.defaultProps = {
  classes: '',
  value: false,
};

export default CheckboxField;
