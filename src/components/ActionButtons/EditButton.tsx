import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

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
    <i className="fa fa-edit fa-2x text-warning" />
  </Button>
);

export default EditButton;
