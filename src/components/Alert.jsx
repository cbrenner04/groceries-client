import React from 'react';
import PropTypes from 'prop-types';
import { Alert as BootstrapAlert } from 'react-bootstrap';

function Alert(props) {
  if (!props.errors && !props.success) return null;
  return (
    <BootstrapAlert variant={props.errors ? 'danger' : 'success'} onClose={props.handleDismiss} dismissible>
      {props.errors || props.success}
    </BootstrapAlert>
  );
}

Alert.propTypes = {
  errors: PropTypes.string,
  success: PropTypes.string,
  handleDismiss: PropTypes.func.isRequired,
};

Alert.defaultProps = {
  errors: '',
  success: '',
};

export default Alert;
