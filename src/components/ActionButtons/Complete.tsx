import React, { type CSSProperties, type MouseEventHandler } from 'react';
import { CheckIcon } from '../icons';

interface ICompleteProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
  style?: CSSProperties;
  classes?: string;
}

const Complete: React.FC<ICompleteProps> = (props): React.JSX.Element => {
  const buttonClassName =
    'tw:flex tw:items-center tw:justify-center tw:min-h-[44px] tw:min-w-[44px] ' +
    'tw:rounded tw:transition-colors tw:duration-200 tw:cursor-pointer me-3';

  return (
    <button
      type="button"
      onClick={props.handleClick}
      className={`${buttonClassName} ${props.classes ?? ''}`}
      data-test-id={props.testID}
      disabled={props.disabled ?? false}
      aria-label="Complete item"
      style={props.style ?? {}}
    >
      <CheckIcon size="2x" className="text-success" data-test-id="check-icon" />
    </button>
  );
};

export default Complete;
