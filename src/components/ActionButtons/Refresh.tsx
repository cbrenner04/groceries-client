import React, { type CSSProperties, type MouseEventHandler } from 'react';
import { RedoIcon } from '../icons';

interface IRefreshProps {
  handleClick: MouseEventHandler;
  testID: string;
  style?: CSSProperties;
  disabled?: boolean;
  classes?: string;
}

const Refresh: React.FC<IRefreshProps> = (props): React.JSX.Element => (
  <button
    type="button"
    onClick={props.handleClick}
    className={`bg-transparent border-0 p-0 me-3 cursor-pointer ${props.classes ?? ''}`}
    data-test-id={props.testID}
    style={props.style ?? {}}
    disabled={props.disabled ?? false}
  >
    <RedoIcon size="2x" className="text-primary" data-test-id="redo-icon" />
  </button>
);

export default Refresh;
