import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface IEditButtonProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
}

const EditButton: React.FC<IEditButtonProps> = ({ handleClick, testID, disabled = false }): React.JSX.Element => (
  <Button variant="link" onClick={handleClick} className="p-0 me-3" disabled={disabled} data-test-id={testID}>
    <i className="fa fa-edit fa-2x text-warning" />
  </Button>
);

export default EditButton;
