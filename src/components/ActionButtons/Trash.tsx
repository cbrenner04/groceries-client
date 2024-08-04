import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface ITrashProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
}

const Trash: React.FC<ITrashProps> = (props): React.JSX.Element => (
  <Button
    variant="link"
    onClick={props.handleClick}
    className="p-0"
    data-test-id={props.testID}
    disabled={props.disabled ?? false}
  >
    <i className="fa fa-trash fa-2x text-danger" />
  </Button>
);

export default Trash;
