import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function Loading() {
  return (
    <div id="loader">
      <Spinner animation="border" role="status" id="spinner">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );
}
