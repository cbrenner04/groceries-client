import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { CompressIcon } from '../icons';

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
    <CompressIcon size="2x" className="text-warning" data-test-id="compress-icon" />
  </Button>
);

export default Merge;
