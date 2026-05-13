import React, { type MouseEventHandler } from 'react';
import { TrashIcon } from '../icons';

interface ITrashProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
}

const Trash: React.FC<ITrashProps> = (props): React.JSX.Element => {
  const buttonClassName =
    'tw:flex tw:items-center tw:justify-center tw:min-h-[44px] tw:min-w-[44px] ' +
    'tw:rounded tw:transition-colors tw:duration-200 tw:cursor-pointer';

  return (
    <button
      type="button"
      onClick={props.handleClick}
      className={buttonClassName}
      data-test-id={props.testID}
      disabled={props.disabled ?? false}
      aria-label="Delete item"
    >
      <TrashIcon size="2x" className="text-danger" data-test-id="trash-icon" />
    </button>
  );
};

export default Trash;
