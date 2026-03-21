import React, { type MouseEventHandler } from 'react';
import { Button } from '../ui/Button';
import { TrashIcon } from '../icons';

interface ITrashProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
}

const Trash: React.FC<ITrashProps> = (props): React.JSX.Element => (
  <Button
    variant="ghost"
    onClick={props.handleClick}
    className="p-0"
    data-test-id={props.testID}
    disabled={props.disabled ?? false}
  >
    <TrashIcon size="2x" className="text-danger" data-test-id="trash-icon" />
  </Button>
);

export default Trash;
