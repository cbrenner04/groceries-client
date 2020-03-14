import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';

function GenericAlert(props) {
  if (props.errors === '' && props.success === '') return '';
  return (
    <Alert variant={props.errors === '' ? 'success' : 'danger'} onClose={props.handleDismiss} dismissible>
      { props.errors || props.success }
    </Alert>
  );
}

GenericAlert.propTypes = {
  errors: PropTypes.string,
  success: PropTypes.string,
  handleDismiss: PropTypes.func.isRequired,
};

GenericAlert.defaultProps = {
  errors: '',
  success: '',
};

export default GenericAlert;
