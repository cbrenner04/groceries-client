import React, { type MouseEventHandler } from 'react';
import { EditIcon } from '../icons';

interface IEditButtonProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
}

const EditButton: React.FC<IEditButtonProps> = (props): React.JSX.Element => {
  const buttonClassName =
    'tw:flex tw:items-center tw:justify-center tw:min-h-[44px] tw:min-w-[44px] ' +
    'tw:rounded tw:transition-colors tw:duration-200 tw:cursor-pointer me-3';

  return (
    <button
      type="button"
      onClick={props.handleClick}
      className={buttonClassName}
      disabled={props.disabled ?? false}
      data-test-id={props.testID}
      aria-label="Edit item"
    >
      <EditIcon size="2x" className="text-warning" data-test-id="edit-icon" />
    </button>
  );
};

export default EditButton;
