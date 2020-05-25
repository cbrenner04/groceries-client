import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Bookmark = ({ handleClick, read, ...rest }) => (
  <Button variant="link" onClick={handleClick} className="p-0 mr-3" {...rest}>
    <i className={`${read ? 'fas' : 'far'} fa-bookmark fa-2x text-info`} />
  </Button>
);

Bookmark.propTypes = {
  handleClick: PropTypes.func.isRequired,
  read: PropTypes.bool,
};

Bookmark.defaultProps = {
  read: false,
};

export default Bookmark;
