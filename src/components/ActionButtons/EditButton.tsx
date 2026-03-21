import React, { type MouseEventHandler } from 'react';
import { EditIcon } from '../icons';

interface IEditButtonProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
}

const EditButton: React.FC<IEditButtonProps> = (props): React.JSX.Element => (
  <button
    type="button"
    onClick={props.handleClick}
    className="bg-transparent border-0 p-0 me-3 cursor-pointer"
    disabled={props.disabled ?? false}
    data-test-id={props.testID}
  >
    <EditIcon size="2x" className="text-warning" data-test-id="edit-icon" />
  </button>
);

export default EditButton;
