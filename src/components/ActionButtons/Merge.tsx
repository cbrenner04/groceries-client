import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

interface IMergeProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled: boolean;
}

const Merge: React.FC<IMergeProps> = (props): React.JSX.Element => (
  <Button
    variant="link"
    onClick={props.handleClick}
    className="p-0 me-3"
    data-test-id={props.testID}
    disabled={props.disabled}
  >
    <i className="fa fa-compress-alt fa-2x text-warning" />
  </Button>
);

export default Merge;
