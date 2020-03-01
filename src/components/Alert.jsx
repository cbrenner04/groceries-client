import React from 'react';
import PropTypes from 'prop-types';

function Alert(props) {
  if (props.errors === '' && props.success === '') return '';
  return (
    <div
      className={`alert alert-${props.errors === '' ? 'success' : 'danger'} alert-dismissible fade show`}
      role="alert"
    >
      <button className="close" onClick={props.handleDismiss} aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      { props.errors || props.success }
    </div>
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
