import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

// TODO: check react-bootstrap has some way of handling the grid
const FormSubmission = (props) => (
  <div className="d-grid gap-2 mt-3">
    <Button type="submit" variant="success" disabled={props.disabled || false}>
      {props.submitText}
    </Button>
    {props.displayCancelButton && (
      <Button variant="link" onClick={props.cancelAction}>
        {props.cancelText || ''}
      </Button>
    )}
  </div>
);

FormSubmission.propTypes = {
  disabled: PropTypes.bool,
  submitText: PropTypes.string.isRequired,
  displayCancelButton: PropTypes.bool.isRequired,
  cancelAction: PropTypes.func.isRequired,
  cancelText: PropTypes.string,
};

export default FormSubmission;
