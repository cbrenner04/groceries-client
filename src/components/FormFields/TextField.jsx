import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const TextField = ({ name, label, value, handleChange, placeholder }) => (
  <Form.Group controlId={name}>
    <Form.Label>{label}</Form.Label>
    <Form.Control type="text" value={value} onChange={handleChange} placeholder={placeholder} name={name} />
  </Form.Group>
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
