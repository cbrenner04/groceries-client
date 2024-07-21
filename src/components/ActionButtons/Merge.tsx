import React, { MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface IMergeProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled: boolean;
}

const Merge: React.FC<IMergeProps> = ({ handleClick, testID, disabled }) => (
  <Button variant="link" onClick={handleClick} className="p-0 me-3" data-test-id={testID} disabled={disabled}>
    <i className="fa fa-compress-alt fa-2x text-warning" />
  </Button>
);

export default Merge;
