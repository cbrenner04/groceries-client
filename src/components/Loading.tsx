import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loading: React.FC = (): React.JSX.Element => (
  <div id="loader">
    <Spinner animation="border" role="status" id="spinner">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

export default Loading;
