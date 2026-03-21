import React, { type MouseEventHandler } from 'react';
import { TrashIcon } from '../icons';

interface ITrashProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
}

const Trash: React.FC<ITrashProps> = (props): React.JSX.Element => (
  <button
    type="button"
    onClick={props.handleClick}
    className="bg-transparent border-0 p-0 cursor-pointer"
    data-test-id={props.testID}
    disabled={props.disabled ?? false}
  >
    <TrashIcon size="2x" className="text-danger" data-test-id="trash-icon" />
  </button>
);

export default Trash;
