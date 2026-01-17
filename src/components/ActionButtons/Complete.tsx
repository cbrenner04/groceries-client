import React, { type CSSProperties, type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';
import { CheckIcon } from '../icons';

interface ICompleteProps {
  handleClick: MouseEventHandler;
  testID: string;
  disabled?: boolean;
  style?: CSSProperties;
  classes?: string;
}

const Complete: React.FC<ICompleteProps> = (props): React.JSX.Element => (
  <Button
    variant="link"
    onClick={props.handleClick}
    className={`p-0 me-3 ${props.classes ?? ''}`}
    data-test-id={props.testID}
    disabled={props.disabled ?? false}
    style={props.style ?? {}}
  >
    <CheckIcon size="2x" className="text-success" data-test-id="check-icon" />
  </Button>
);

export default Complete;
