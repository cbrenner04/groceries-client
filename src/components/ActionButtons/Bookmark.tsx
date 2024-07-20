import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Bookmark = ({ handleClick, read, testID }) => (
  <Button variant="link" onClick={handleClick} className="p-0 me-3" data-test-id={testID}>
    <i className={`${read ? 'fas' : 'far'} fa-bookmark fa-2x text-secondary`} />
  </Button>
);

Bookmark.propTypes = {
  handleClick: PropTypes.func.isRequired,
  read: PropTypes.bool.isRequired,
  testID: PropTypes.string.isRequired,
};

export default Bookmark;
