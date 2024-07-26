import React from 'react';
import { Button } from 'react-bootstrap';

const NoFilter: React.FC = (): React.JSX.Element => (
  <Button variant="light" id="no-filter" disabled>
    Filter by category
  </Button>
);

export default NoFilter;
