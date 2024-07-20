import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const CheckboxField = ({ name, label, value, handleChange, classes, type }) => (
  <Form.Group controlId={name} className={`${classes || ''} mb-3`}>
    <Form.Check type={type || 'checkbox'} checked={value || false} onChange={handleChange} label={label} name={name} />
  </Form.Group>
);

CheckboxField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.bool,
  handleChange: PropTypes.func.isRequired,
  classes: PropTypes.string,
  type: PropTypes.string,
};

export default CheckboxField;
