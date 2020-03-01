import React from 'react';
import PropTypes from 'prop-types';

const SelectField = ({
  name,
  label,
  value,
  handleChange,
  options,
  blankOption,
}) => (
  <div className="form-group">
    <label htmlFor={name}>{label}</label>
    <select
      className="form-control"
      id={name}
      value={value || ''}
      onChange={handleChange}
    >
      {blankOption &&
        <option
          value=""
          disabled={!value}
        >
          {value ? `Clear ${label}` : `Select ${label}` }
        </option>
      }
      {
        options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))
      }
    </select>
  </div>
);

SelectField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  })).isRequired,
  blankOption: PropTypes.bool.isRequired,
};

export default SelectField;
