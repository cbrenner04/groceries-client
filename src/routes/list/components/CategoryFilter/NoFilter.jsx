import React from 'react';
import { Button } from 'react-bootstrap';

const NoFilter = () => (
  <Button variant="light" disabled style={{ cursor: 'not-allowed' }}>
    Filter by category
  </Button>
);

export default NoFilter;
