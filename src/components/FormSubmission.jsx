import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

// TODO: check react-bootstrap has some way of handling the grid
const FormSubmission = (props) => {
  const defaultProps = {
    disabled: false,
    displayCancelButton: true,
    cancelAction: () => undefined,
    cancelText: '',
  };
  const propsWithDefaults = { ...defaultProps, ...props };
  return (
    <div className="d-grid gap-2 mt-3">
      <Button type="submit" variant="success" disabled={propsWithDefaults.disabled}>
        {propsWithDefaults.submitText}
      </Button>
      {propsWithDefaults.displayCancelButton && (
        <Button variant="link" onClick={propsWithDefaults.cancelAction}>
          {propsWithDefaults.cancelText}
        </Button>
      )}
    </div>
  );
};

/* eslint-disable react/require-default-props */
FormSubmission.propTypes = {
  disabled: PropTypes.bool,
  submitText: PropTypes.string.isRequired,
  displayCancelButton: PropTypes.bool,
  cancelAction: PropTypes.func,
  cancelText: PropTypes.string,
};
/* eslint-enable react/require-default-props */

export default FormSubmission;
