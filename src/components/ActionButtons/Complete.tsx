import React, { type CSSProperties, type MouseEventHandler } from 'react';
import { CheckIcon } from '../icons';

interface ICompleteProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
  style?: CSSProperties;
  classes?: string;
}

const Complete: React.FC<ICompleteProps> = (props): React.JSX.Element => (
  <button
    type="button"
    onClick={props.handleClick}
    className={`bg-transparent border-0 p-0 me-3 cursor-pointer ${props.classes ?? ''}`}
    data-test-id={props.testID}
    disabled={props.disabled ?? false}
    style={props.style ?? {}}
  >
    <CheckIcon size="2x" className="text-success" data-test-id="check-icon" />
  </button>
);

export default Complete;
