import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading: React.FC = () => (
  <div id="loader">
    <Spinner animation="border" role="status" id="spinner">
      <span className="sr-only">Loading...</span>
    </Spinner>
  </div>
);

export default Loading;
