import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { EditIcon } from '../icons';

interface IEditButtonProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
}

const EditButton: React.FC<IEditButtonProps> = (props): React.JSX.Element => (
  <Button
    variant="link"
    onClick={props.handleClick}
    className="p-0 me-3"
    disabled={props.disabled ?? false}
    data-test-id={props.testID}
  >
    <EditIcon size="2x" className="text-warning" data-test-id="edit-icon" />
  </Button>
);

export default EditButton;
