import React, { MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface ITrashProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
}

const Trash: React.FC<ITrashProps> = ({ handleClick, testID, disabled = false }) => (
  <Button variant="link" onClick={handleClick} className="p-0" data-test-id={testID} disabled={disabled}>
    <i className="fa fa-trash fa-2x text-danger" />
  </Button>
);

export default Trash;
