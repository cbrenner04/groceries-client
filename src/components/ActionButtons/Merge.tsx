import React, { type MouseEventHandler } from 'react';
import { CompressIcon } from '../icons';

interface IMergeProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled: boolean;
}

const Merge: React.FC<IMergeProps> = (props): React.JSX.Element => (
  <button
    type="button"
    onClick={props.handleClick}
    className="bg-transparent border-0 p-0 me-3 cursor-pointer"
    data-test-id={props.testID}
    disabled={props.disabled}
  >
    <CompressIcon size="2x" className="text-warning" data-test-id="compress-icon" />
  </button>
);

export default Merge;
