import React from 'react';
import PropTypes from 'prop-types';
import { Alert as BootstrapAlert } from 'react-bootstrap';

function Alert(props) {
  if (props.errors === '' && props.success === '') return '';
  return (
    <BootstrapAlert variant={props.errors === '' ? 'success' : 'danger'} onClose={props.handleDismiss} dismissible>
      {props.errors || props.success}
    </BootstrapAlert>
  );
}

Alert.propTypes = {
  errors: PropTypes.string,
  success: PropTypes.string,
  handleDismiss: PropTypes.func,
};

Alert.defaultProps = {
  errors: '',
  success: '',
  handleDismiss: () => {},
};

export default Alert;
