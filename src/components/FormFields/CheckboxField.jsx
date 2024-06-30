import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const CheckboxField = ({ name, label, value, handleChange, classes }) => (
  <Form.Group controlId={name} className={`${classes} mb-3`}>
    <Form.Check type="checkbox" checked={value} onChange={handleChange} label={label} name={name} />
  </Form.Group>
);

CheckboxField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.bool.isRequired,
  handleChange: PropTypes.func.isRequired,
  classes: PropTypes.string.isRequired,
};

export default CheckboxField;
