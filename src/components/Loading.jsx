import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Spinner
        animation="border"
        role="status"
        style={{ width: '100px', height: '100px', position: 'absolute', top: '50%' }}
      >
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );
}
